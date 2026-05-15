using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Repositories;

public class CabinRepository(AppDbContext db) : ICabinRepository
{
    public Task<Cabin?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Cabins.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<Cabin>> GetAllActiveAsync(CancellationToken ct = default) =>
        await db.Cabins.Where(c => c.IsActive).ToListAsync(ct);

    public async Task<Cabin> AddAsync(Cabin cabin, CancellationToken ct = default)
    {
        db.Cabins.Add(cabin);
        await db.SaveChangesAsync(ct);
        return cabin;
    }

    public async Task UpdateAsync(Cabin cabin, CancellationToken ct = default)
    {
        db.Cabins.Update(cabin);
        await db.SaveChangesAsync(ct);
    }
}
