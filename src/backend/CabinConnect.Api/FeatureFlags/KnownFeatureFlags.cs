namespace CabinConnect.Api.FeatureFlags;

/// <summary>
/// Registry of all known feature flag names. A flag MUST be listed here before it
/// can be queried via <see cref="IFeatureFlags"/>; querying an unknown flag throws.
/// </summary>
public static class KnownFeatureFlags
{
    public const string CabinProfileMvp = "cabin_profile_mvp";

    private static readonly HashSet<string> All = new(StringComparer.Ordinal)
    {
        CabinProfileMvp,
    };

    public static bool IsKnown(string name) => All.Contains(name);
}
