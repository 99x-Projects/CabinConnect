using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Application.Cabins;

public interface ICabinRepository
{
    Task<IReadOnlyList<Cabin>> GetAllForHostAsync(Guid hostId, CancellationToken cancellationToken);

    Task<Cabin?> GetByIdForHostAsync(Guid cabinId, Guid hostId, CancellationToken cancellationToken);

    /// <summary>
    /// Sets isActive = false for the Cabin. Returns false only if the Cabin does not exist
    /// or is owned by a different Host. Succeeds idempotently if already deactivated (EC-011).
    /// </summary>
    Task<bool> DeactivateAsync(Guid cabinId, Guid hostId, CancellationToken cancellationToken);

    Task<Cabin?> UpdateAsync(
        Guid cabinId,
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken);

    Task<Cabin> CreateAsync(
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken);
}
