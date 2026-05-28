using CabinConnect.Api.FeatureFlags;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace CabinConnect.Api.Tests;

public class FeatureFlagsTests
{
    private static IFeatureFlags Build(Dictionary<string, string?>? values = null)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(values ?? new Dictionary<string, string?>())
            .Build();
        return new ConfigurationFeatureFlags(config);
    }

    [Fact]
    public void Defaults_to_false_when_key_missing()
    {
        var flags = Build();
        Assert.False(flags.IsEnabled(KnownFeatureFlags.CabinProfileMvp));
    }

    [Fact]
    public void Returns_true_when_configured_true()
    {
        var flags = Build(new Dictionary<string, string?>
        {
            ["FeatureFlags:cabin_profile_mvp"] = "true",
        });
        Assert.True(flags.IsEnabled(KnownFeatureFlags.CabinProfileMvp));
    }

    [Fact]
    public void Throws_for_unknown_flag_name()
    {
        var flags = Build();
        var ex = Assert.Throws<ArgumentException>(() => flags.IsEnabled("not_registered"));
        Assert.Contains("Unknown feature flag", ex.Message);
    }
}
