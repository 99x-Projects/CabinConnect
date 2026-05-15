using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Repositories;

public class CabinKeyInfoRepository(AppDbContext db) : ICabinKeyInfoRepository
{
    public async Task<CabinKeyInfo?> GetByCabinIdAsync(Guid cabinId, CancellationToken ct = default) =>
        await db.CabinKeyInfos.FirstOrDefaultAsync(k => k.CabinId == cabinId, ct);

    public async Task AddAsync(CabinKeyInfo keyInfo, CancellationToken ct = default)
    {
        db.CabinKeyInfos.Add(keyInfo);
        await db.SaveChangesAsync(ct);
    }

    public async Task SaveAsync(CancellationToken ct = default) =>
        await db.SaveChangesAsync(ct);
}
