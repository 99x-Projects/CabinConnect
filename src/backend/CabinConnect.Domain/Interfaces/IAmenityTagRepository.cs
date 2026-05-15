using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface IAmenityTagRepository
{
    Task<IReadOnlyList<AmenityTag>> GetAllOrderedByNameAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AmenityTag>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
}
