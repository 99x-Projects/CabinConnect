using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface ICabinRepository
{
    Task<Cabin?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Cabin>> GetAllActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Cabin>> GetByHostIdAsync(Guid hostId, CancellationToken ct = default);
    Task<Cabin> AddAsync(Cabin cabin, CancellationToken ct = default);
    Task UpdateAsync(Cabin cabin, CancellationToken ct = default);
}
