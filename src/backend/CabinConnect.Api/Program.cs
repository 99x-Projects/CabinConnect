using CabinConnect.Api.Auth;
using CabinConnect.Api.Cabins;
using CabinConnect.Api.Communities;
using CabinConnect.Api.Cors;
using CabinConnect.Api.FeatureFlags;
using CabinConnect.Api.Users;
using CabinConnect.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Optional, gitignored overrides for secrets/local-only settings (Supabase URLs,
// connection strings, etc.). Loaded last so it wins over appsettings.Development.json.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IFeatureFlags, ConfigurationFeatureFlags>();
builder.Services.AddCabinConnectPersistence(builder.Configuration);
builder.Services.AddCabinConnectAuth(
    builder.Configuration,
    requireHttpsMetadata: !builder.Environment.IsDevelopment());
builder.Services.AddCabinConnectCors(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CabinConnect.Api.Cors.CorsServiceCollectionExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new HealthResponse("ok")))
    .AllowAnonymous()
    .WithName("Health")
    .WithOpenApi();

// Diagnostic endpoint. Subject to the global fallback auth policy — returns 401 when
// unauthenticated. Used by the JWT validation matrix test in CabinConnect.Api.Tests.
app.MapGet("/_auth-ping", (CabinConnect.Domain.Auth.ICurrentUser user) =>
        Results.Ok(new { userId = user.Id }))
    .WithName("AuthPing");

app.MapCommunitiesEndpoints();
app.MapUsersEndpoints();
app.MapCabinsEndpoints();

app.Run();

internal sealed record HealthResponse(string Status);

/// <summary>
/// Exposed as <c>public partial</c> so <c>WebApplicationFactory&lt;Program&gt;</c> in the
/// test project can boot the API host without <c>InternalsVisibleTo</c>.
/// </summary>
public partial class Program { }
