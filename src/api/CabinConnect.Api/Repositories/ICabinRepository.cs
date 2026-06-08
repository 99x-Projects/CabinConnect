using CabinConnect.Api.Domain.Entities;

namespace CabinConnect.Api.Repositories;

/// <summary>
/// Data access contract for Cabin. All reads exclude soft-deleted records
/// unless explicitly stated. Owner scoping is enforced by the caller supplying ownerId.
/// </summary>
public interface ICabinRepository
{
    Task<IReadOnlyList<Cabin>> ListByOwnerAsync(Guid ownerId, CancellationToken ct = default);
    Task<Cabin?> GetByIdAndOwnerAsync(Guid id, Guid ownerId, CancellationToken ct = default);
    Task<int> CountActiveByOwnerAsync(Guid ownerId, CancellationToken ct = default);
    Task<Cabin> CreateAsync(Cabin cabin, CancellationToken ct = default);
    Task<Cabin> UpdateAsync(Cabin cabin, CancellationToken ct = default);
}
