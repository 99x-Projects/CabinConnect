using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface IAmenityTagRepository
{
    Task<IReadOnlyList<AmenityTag>> GetAllOrderedByNameAsync(CancellationToken ct = default);
}
