namespace CabinConnect.Api.FeatureFlags;

/// <summary>
/// Resolves the state of a named feature flag. Implementations MUST throw if the
/// supplied flag name is not registered in <see cref="KnownFeatureFlags"/>.
/// </summary>
public interface IFeatureFlags
{
    bool IsEnabled(string flagName);
}
