using Microsoft.Extensions.Configuration;

namespace CabinConnect.Api.FeatureFlags;

/// <summary>
/// Reads feature-flag values from configuration under the <c>FeatureFlags</c> section.
/// Defaults to <see langword="false"/> when the key is missing. Throws when the supplied
/// flag name is not registered.
/// </summary>
public sealed class ConfigurationFeatureFlags : IFeatureFlags
{
    private const string SectionName = "FeatureFlags";

    private readonly IConfiguration _configuration;

    public ConfigurationFeatureFlags(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool IsEnabled(string flagName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(flagName);

        if (!KnownFeatureFlags.IsKnown(flagName))
        {
            throw new ArgumentException($"Unknown feature flag: {flagName}", nameof(flagName));
        }

        return _configuration.GetValue($"{SectionName}:{flagName}", defaultValue: false);
    }
}
