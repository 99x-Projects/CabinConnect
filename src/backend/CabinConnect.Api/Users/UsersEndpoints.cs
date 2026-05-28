using System.Security.Claims;
using System.Text.Json;
using CabinConnect.Domain.Auth;
using CabinConnect.Domain.Users;
using CabinConnect.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Users;

public static class UsersEndpoints
{
    private const int DisplayNameMaxLength = 100;

    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/users/me", async (
                ICurrentUser current,
                ClaimsPrincipal principal,
                CabinConnectDbContext db,
                CancellationToken ct) =>
            {
                // Identity is always sourced from the verified JWT (EC-007). The
                // request body / route is never trusted to supply a user id.
                var userId = current.Id;

                var user = await db.Users
                    .AsTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId, ct);

                var jwtEmail = principal.FindFirst("email")?.Value
                    ?? principal.FindFirst(ClaimTypes.Email)?.Value
                    ?? string.Empty;
                var jwtDisplayName = ExtractDisplayName(principal, fallbackEmail: jwtEmail);

                if (user is null)
                {
                    // Lazy provisioning (AC2). Idempotent under race via PK on id —
                    // a concurrent insert results in a UniqueViolation that we
                    // swallow and re-read.
                    user = new User
                    {
                        Id = userId,
                        DisplayName = Truncate(jwtDisplayName, DisplayNameMaxLength),
                        Email = jwtEmail,
                        Role = UserRole.Owner,
                        CreatedAt = DateTime.UtcNow,
                    };
                    db.Users.Add(user);
                    try
                    {
                        await db.SaveChangesAsync(ct);
                    }
                    catch (DbUpdateException)
                    {
                        // Another concurrent request inserted the row first.
                        db.Entry(user).State = EntityState.Detached;
                        user = await db.Users.AsTracking().FirstAsync(u => u.Id == userId, ct);
                    }
                }
                else
                {
                    // EC-D: write-through if Supabase email changed since last read.
                    if (!string.IsNullOrWhiteSpace(jwtEmail)
                        && !string.Equals(user.Email, jwtEmail, StringComparison.Ordinal))
                    {
                        user.Email = jwtEmail;
                        await db.SaveChangesAsync(ct);
                    }
                }

                var dto = new UserDto(
                    user.Id,
                    user.DisplayName,
                    user.Email,
                    user.Role.ToString().ToLowerInvariant(),
                    user.CreatedAt);

                return Results.Ok(dto);
            })
            .WithName("GetCurrentUser")
            .WithOpenApi();

        return routes;
    }

    private static string ExtractDisplayName(ClaimsPrincipal principal, string fallbackEmail)
    {
        // Supabase exposes sign-up metadata under the `user_metadata` claim as a
        // JSON object. We try the conventional `display_name` field first.
        var metadataRaw = principal.FindFirst("user_metadata")?.Value;
        if (!string.IsNullOrWhiteSpace(metadataRaw))
        {
            try
            {
                using var doc = JsonDocument.Parse(metadataRaw);
                if (doc.RootElement.TryGetProperty("display_name", out var displayName)
                    && displayName.ValueKind == JsonValueKind.String)
                {
                    var value = displayName.GetString();
                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        return value.Trim();
                    }
                }
            }
            catch (JsonException)
            {
                // Malformed claim — fall through to email-based fallback.
            }
        }

        // Fallback: email local part, or a generic placeholder if even that is missing.
        if (!string.IsNullOrWhiteSpace(fallbackEmail))
        {
            var at = fallbackEmail.IndexOf('@');
            return at > 0 ? fallbackEmail[..at] : fallbackEmail;
        }

        return "Cabin Owner";
    }

    private static string Truncate(string value, int max) =>
        value.Length <= max ? value : value[..max];
}
