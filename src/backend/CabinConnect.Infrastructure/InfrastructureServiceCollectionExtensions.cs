using CabinConnect.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CabinConnect.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    /// <summary>
    /// Registers <see cref="CabinConnectDbContext"/> using the named connection string
    /// <c>ConnectionStrings:CabinConnect</c> (the runtime app role — limited privileges,
    /// RLS applies). The migration role uses a separate connection string,
    /// <c>ConnectionStrings:CabinConnectMigrations</c>, and is wired only by the
    /// design-time factory and the CLI; the runtime never sees it.
    ///
    /// If the connection string is missing or empty, registration is skipped. This
    /// lets the API host boot in test / scaffold environments without a real DB.
    /// Any attempt to resolve <see cref="CabinConnectDbContext"/> at runtime in that
    /// state will throw a clear DI error.
    /// </summary>
    public static IServiceCollection AddCabinConnectPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CabinConnect");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return services;
        }

        services.AddDbContext<CabinConnectDbContext>(options =>
            options
                .UseNpgsql(connectionString)
                .UseSnakeCaseNamingConvention());

        return services;
    }
}
