using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface ICabinKeyInfoRepository
{
    Task<CabinKeyInfo?> GetByCabinIdAsync(Guid cabinId, CancellationToken ct = default);
    Task AddAsync(CabinKeyInfo keyInfo, CancellationToken ct = default);
    Task SaveAsync(CancellationToken ct = default);
}
