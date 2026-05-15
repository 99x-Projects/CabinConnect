namespace CabinConnect.Domain.Exceptions;

public class CabinVersionConflictException(Guid id, int currentVersion)
    : Exception($"Cabin '{id}' has been modified. Current version is {currentVersion}.")
{
    public int CurrentVersion { get; } = currentVersion;
}
