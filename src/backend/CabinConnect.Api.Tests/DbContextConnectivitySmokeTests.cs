using CabinConnect.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace CabinConnect.Api.Tests;

/// <summary>
/// Smoke test for <see cref="CabinConnectDbContext"/> connectivity.
///
/// This test is opt-in: it requires a reachable Postgres instance configured via
/// the environment variable <c>ConnectionStrings__CabinConnectTest</c>. When
/// unset (the default for local-dev without Docker and for CI without a DB),
/// the test is skipped so it never gates the suite. To run it, set the env var
/// to a valid Npgsql connection string and re-run <c>dotnet test</c>.
/// </summary>
public class DbContextConnectivitySmokeTests
{
    private const string EnvVarName = "ConnectionStrings__CabinConnectTest";

    [SkippableFact]
    public async Task DbContext_can_connect_when_connection_string_is_provided()
    {
        var connectionString = Environment.GetEnvironmentVariable(EnvVarName);
        Skip.If(
            string.IsNullOrWhiteSpace(connectionString),
            $"Skipped: {EnvVarName} is not set. Provide a Postgres connection string to run this smoke test.");

        var options = new DbContextOptionsBuilder<CabinConnectDbContext>()
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .Options;

        await using var ctx = new CabinConnectDbContext(options);
        var canConnect = await ctx.Database.CanConnectAsync();
        Assert.True(canConnect, "DbContext.CanConnectAsync() returned false.");
    }
}
