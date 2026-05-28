using CabinConnect.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CabinConnect.Infrastructure;

/// <summary>
/// Design-time factory used by <c>dotnet ef</c> only. Picks the migration-role
/// connection string (<c>ConnectionStrings:CabinConnectMigrations</c>) so DDL
/// runs as the privileged postgres role, separate from the runtime app role.
/// Reads from environment variables, user-secrets, and appsettings.json (in
/// that precedence) — never hardcoded secrets.
/// </summary>
public sealed class CabinConnectDbContextFactory : IDesignTimeDbContextFactory<CabinConnectDbContext>
{
    public CabinConnectDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();

        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddJsonFile("appsettings.Local.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("CabinConnectMigrations")
            ?? config.GetConnectionString("CabinConnect")
            ?? throw new InvalidOperationException(
                "Neither ConnectionStrings:CabinConnectMigrations nor "
                + "ConnectionStrings:CabinConnect is configured. Use "
                + "`dotnet user-secrets set ConnectionStrings:CabinConnectMigrations \"...\"` "
                + "in the CabinConnect.Api project, or set the env var "
                + "ConnectionStrings__CabinConnectMigrations.");

        var options = new DbContextOptionsBuilder<CabinConnectDbContext>()
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .Options;

        return new CabinConnectDbContext(options);
    }
}
