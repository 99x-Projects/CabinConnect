using CabinConnect.Api.Cors;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CabinConnect.Api.Cors;

public static class CorsServiceCollectionExtensions
{
    public const string PolicyName = "CabinConnectFrontend";

    /// <summary>
    /// Reads <see cref="CorsOptions"/> and registers a single named CORS policy.
    /// Throws at startup when <c>AllowCredentials = true</c> combined with a
    /// wildcard <c>*</c> origin — a combination the browser would reject and that
    /// indicates a misconfiguration.
    /// </summary>
    public static IServiceCollection AddCabinConnectCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var corsOptions = configuration.GetSection(CorsOptions.SectionName)
            .Get<CorsOptions>() ?? new CorsOptions();

        if (corsOptions.AllowCredentials &&
            corsOptions.AllowedOrigins.Any(o => o == "*"))
        {
            throw new InvalidOperationException(
                "Cors:AllowedOrigins contains '*' while Cors:AllowCredentials is true. "
                + "Browsers reject this combination. Set explicit origins or disable credentials.");
        }

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                if (corsOptions.AllowedOrigins.Length == 0)
                {
                    policy.DisallowCredentials();
                    return;
                }

                policy.WithOrigins(corsOptions.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithExposedHeaders("WWW-Authenticate");

                if (corsOptions.AllowCredentials)
                {
                    policy.AllowCredentials();
                }
            });
        });

        return services;
    }
}
