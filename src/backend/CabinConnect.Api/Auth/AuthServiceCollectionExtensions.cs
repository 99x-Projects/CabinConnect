using CabinConnect.Domain.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CabinConnect.Api.Auth;

public static class AuthServiceCollectionExtensions
{
    /// <summary>
    /// Wires Supabase JWT bearer validation, the <see cref="ICurrentUser"/> implementation,
    /// and a global fallback policy that requires an authenticated user on every endpoint
    /// except those explicitly marked <c>.AllowAnonymous()</c>.
    ///
    /// In <c>Testing</c> environment the Authority HTTPS requirement is relaxed and the
    /// caller is expected to override <see cref="JwtBearerOptions.TokenValidationParameters"/>
    /// via post-configuration to point at a local test issuer + signing key.
    /// </summary>
    public static IServiceCollection AddCabinConnectAuth(
        this IServiceCollection services,
        IConfiguration configuration,
        bool requireHttpsMetadata = true)
    {
        services.AddOptions<SupabaseAuthOptions>()
            .Bind(configuration.GetSection(SupabaseAuthOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, HttpContextCurrentUser>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                // Defer reading the bound options until configure-time so DI is ready.
                var authOptions = configuration
                    .GetSection(SupabaseAuthOptions.SectionName)
                    .Get<SupabaseAuthOptions>() ?? new SupabaseAuthOptions();

                options.Authority = string.IsNullOrWhiteSpace(authOptions.Authority)
                    ? null
                    : authOptions.Authority;
                options.RequireHttpsMetadata = requireHttpsMetadata;

                // JwtBearer expects OpenID Connect discovery metadata here, not
                // the raw JWKS document. Using JWKS as MetadataAddress causes
                // key/issuer discovery failures and cascades into 401 responses.
                if (!string.IsNullOrWhiteSpace(authOptions.Authority))
                {
                    var authority = authOptions.Authority.TrimEnd('/');
                    options.MetadataAddress = $"{authority}/.well-known/openid-configuration";
                }

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = !string.IsNullOrWhiteSpace(authOptions.Authority),
                    ValidIssuer = string.IsNullOrWhiteSpace(authOptions.Authority)
                        ? null
                        : authOptions.Authority,
                    ValidateAudience = true,
                    ValidAudience = authOptions.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = ctx =>
                    {
                        var logger = ctx.HttpContext.RequestServices
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("CabinConnect.Auth");
                        // Server-side only — reason is never returned to the client.
                        logger.LogDebug(ctx.Exception, "JWT validation failed.");
                        return Task.CompletedTask;
                    },
                };
            });

        services.AddAuthorization(options =>
        {
            // Global fallback policy: every endpoint requires an authenticated user
            // unless explicitly marked .AllowAnonymous(). /health is anonymous.
            options.FallbackPolicy = new AuthorizationPolicyBuilder(
                    JwtBearerDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .Build();
        });

        return services;
    }
}
