using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using CabinConnect.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace CabinConnect.Api.Tests.Helpers;

/// <summary>
/// Test host that combines the in-process RSA JWT setup (mirroring the
/// production <c>SupabaseAuth</c> validation path) with an EF InMemory
/// <see cref="CabinConnectDbContext"/>. Endpoint tests use this to exercise
/// authn + persistence without Docker or a live database.
/// </summary>
public sealed class JwtAndDbTestFactory : WebApplicationFactory<Program>
{
    public const string ValidIssuer = "https://test-issuer.cabinconnect.local";
    public const string ValidAudience = "authenticated";

    private readonly RSA _rsa = RSA.Create(2048);
    private readonly string _kid = Guid.NewGuid().ToString("N");
    private readonly string _dbName = Guid.NewGuid().ToString("N");
    private readonly InMemoryLogCollector _logCollector = new();

    public string MintToken(
        Guid userId,
        string? email = null,
        string? displayName = null,
        string issuer = ValidIssuer,
        string audience = ValidAudience,
        DateTime? expires = null)
    {
        var key = new RsaSecurityKey(_rsa) { KeyId = _kid };
        var creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);
        var exp = expires ?? DateTime.UtcNow.AddMinutes(5);
        var notBefore = exp.AddMinutes(-10);

        var claims = new List<Claim> { new("sub", userId.ToString()) };
        if (!string.IsNullOrWhiteSpace(email))
        {
            claims.Add(new Claim("email", email));
        }

        if (!string.IsNullOrWhiteSpace(displayName))
        {
            var metadata = $"{{\"display_name\":\"{displayName}\"}}";
            claims.Add(new Claim("user_metadata", metadata, "JSON"));
        }

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: notBefore,
            expires: exp,
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }

    public HttpClient CreateAuthenticatedClient(
        Guid userId,
        string? email = null,
        string? displayName = null)
    {
        var client = CreateClient();
        var token = MintToken(userId, email: email, displayName: displayName);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    /// <summary>
    /// Runs <paramref name="action"/> against a fresh scope's
    /// <see cref="CabinConnectDbContext"/>. Useful for test arrangement and
    /// post-assertion reads.
    /// </summary>
    public async Task WithDbContextAsync(Func<CabinConnectDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CabinConnectDbContext>();
        await action(db);
    }

    public void ClearCapturedLogs()
    {
        _logCollector.Clear();
    }

    public IReadOnlyList<string> GetCapturedLogs()
    {
        return _logCollector.Snapshot();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["SupabaseAuth:Authority"] = ValidIssuer,
                ["SupabaseAuth:Audience"] = ValidAudience,
                ["SupabaseAuth:JwksUrl"] = "",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173",
                ["Cors:AllowCredentials"] = "true",
                // Force the runtime DbContext registration to be skipped — the
                // test host wires its own InMemory provider below.
                ["ConnectionStrings:CabinConnect"] = "",
            });
        });

        builder.ConfigureServices(services =>
        {
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.Authority = null!;
                options.MetadataAddress = null!;
                options.RequireHttpsMetadata = false;
                options.ConfigurationManager = null!;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = ValidIssuer,
                    ValidateAudience = true,
                    ValidAudience = ValidAudience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(_rsa) { KeyId = _kid },
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

            // Replace any previous DbContext registration with an isolated
            // InMemory database (unique per factory instance).
            services.RemoveAll(typeof(DbContextOptions<CabinConnectDbContext>));
            services.RemoveAll(typeof(CabinConnectDbContext));
            services.AddDbContext<CabinConnectDbContext>(o => o.UseInMemoryDatabase(_dbName));

            services.AddSingleton(_logCollector);
            services.AddSingleton<ILoggerProvider, InMemoryLoggerProvider>();
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _rsa.Dispose();
        }
        base.Dispose(disposing);
    }
}
