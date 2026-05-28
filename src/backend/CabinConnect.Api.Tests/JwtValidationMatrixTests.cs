using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using CabinConnect.Api.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace CabinConnect.Api.Tests;

/// <summary>
/// JWT validation matrix. Uses an in-process RSA key as the signing key (no JWKS HTTP
/// fetch, no Docker, no WireMock). The test fixture post-configures
/// <see cref="JwtBearerOptions"/> to use the in-memory key and disables the metadata
/// endpoint, exercising the exact production code path for issuer/audience/lifetime/
/// signature validation.
/// </summary>
public class JwtValidationMatrixTests : IClassFixture<JwtTestFactory>
{
    private const string ValidIssuer = "https://test-issuer.cabinconnect.local";
    private const string ValidAudience = "authenticated";
    private static readonly Guid TestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    private readonly JwtTestFactory _factory;

    public JwtValidationMatrixTests(JwtTestFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_is_anonymous_and_returns_200_without_token()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task AuthPing_without_token_returns_401()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/_auth-ping");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task AuthPing_with_valid_token_returns_200()
    {
        var token = _factory.MintToken(ValidIssuer, ValidAudience, TestUserId, expires: DateTime.UtcNow.AddMinutes(5));
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.GetAsync("/_auth-ping");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task AuthPing_with_expired_token_returns_401()
    {
        var token = _factory.MintToken(ValidIssuer, ValidAudience, TestUserId, expires: DateTime.UtcNow.AddMinutes(-5));
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.GetAsync("/_auth-ping");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task AuthPing_with_wrong_audience_returns_401()
    {
        var token = _factory.MintToken(ValidIssuer, "some-other-audience", TestUserId, expires: DateTime.UtcNow.AddMinutes(5));
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.GetAsync("/_auth-ping");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task AuthPing_with_wrong_issuer_returns_401()
    {
        var token = _factory.MintToken("https://evil.example.com", ValidAudience, TestUserId, expires: DateTime.UtcNow.AddMinutes(5));
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var resp = await client.GetAsync("/_auth-ping");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }
}

/// <summary>
/// Boots the API host with an in-process RSA signing key bound directly into
/// <see cref="JwtBearerOptions"/>. No HTTP JWKS, no Docker, no WireMock.
/// </summary>
public sealed class JwtTestFactory : WebApplicationFactory<Program>
{
    private readonly RSA _rsa = RSA.Create(2048);
    private readonly string _kid = Guid.NewGuid().ToString("N");

    public string MintToken(string issuer, string audience, Guid userId, DateTime expires)
    {
        var key = new RsaSecurityKey(_rsa) { KeyId = _kid };
        var creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);
        var notBefore = expires.AddMinutes(-10);
        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: new[] { new Claim("sub", userId.ToString()) },
            notBefore: notBefore,
            expires: expires,
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["SupabaseAuth:Authority"] = "https://test-issuer.cabinconnect.local",
                ["SupabaseAuth:Audience"] = "authenticated",
                ["SupabaseAuth:JwksUrl"] = "",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173",
                ["Cors:AllowCredentials"] = "true",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Override the JWT bearer options post-configuration so the validator
            // uses our in-memory key and skips the metadata endpoint.
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.Authority = null!;
                options.MetadataAddress = null!;
                options.RequireHttpsMetadata = false;
                options.ConfigurationManager = null!;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = "https://test-issuer.cabinconnect.local",
                    ValidateAudience = true,
                    ValidAudience = "authenticated",
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(_rsa) { KeyId = _kid },
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });
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
