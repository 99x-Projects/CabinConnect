using System.Net;
using System.Text;
using System.Text.Json;
using CabinConnect.Domain.Exceptions;

namespace CabinConnect.Api.Infrastructure;

public class SupabaseAdminClient(HttpClient http) : ISupabaseAdminClient
{
    public async Task<Guid> InviteUserAsync(string email, CancellationToken ct = default)
    {
        var body = JsonSerializer.Serialize(new { email });
        var content = new StringContent(body, Encoding.UTF8, "application/json");

        var res = await http.PostAsync("/auth/v1/invite", content, ct);

        if (res.StatusCode == HttpStatusCode.UnprocessableEntity ||
            res.StatusCode == HttpStatusCode.Conflict)
        {
            throw new UserAlreadyExistsException(email);
        }

        res.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
        var idStr = doc.RootElement.GetProperty("id").GetString()
            ?? throw new InvalidOperationException("Supabase invite response missing 'id'.");

        return Guid.Parse(idStr);
    }

    public async Task DeleteUserAsync(Guid userId, CancellationToken ct = default)
    {
        var res = await http.DeleteAsync($"/auth/v1/admin/users/{userId}", ct);
        res.EnsureSuccessStatusCode();
    }
}
