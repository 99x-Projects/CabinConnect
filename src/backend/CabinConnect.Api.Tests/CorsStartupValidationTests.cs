using CabinConnect.Api.Cors;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CabinConnect.Api.Tests;

public class CorsStartupValidationTests
{
    [Fact]
    public void Throws_when_allow_credentials_combined_with_wildcard_origin()
    {
        var services = new ServiceCollection();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowCredentials"] = "true",
                ["Cors:AllowedOrigins:0"] = "*",
            })
            .Build();

        var ex = Assert.Throws<InvalidOperationException>(
            () => services.AddCabinConnectCors(config));
        Assert.Contains("'*'", ex.Message);
    }

    [Fact]
    public void Does_not_throw_for_explicit_origins_with_credentials()
    {
        var services = new ServiceCollection();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowCredentials"] = "true",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173",
            })
            .Build();

        services.AddCabinConnectCors(config); // should not throw
    }

    [Fact]
    public void Does_not_throw_for_wildcard_without_credentials()
    {
        var services = new ServiceCollection();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowCredentials"] = "false",
                ["Cors:AllowedOrigins:0"] = "*",
            })
            .Build();

        services.AddCabinConnectCors(config); // should not throw
    }
}
