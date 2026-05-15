using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CabinConnect.Infrastructure.Repositories;

public class CabinRepository(AppDbContext db) : ICabinRepository
{
    public Task<Cabin?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Cabins.Include(c => c.AmenityTags).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<Cabin>> GetAllActiveAsync(CancellationToken ct = default) =>
        await db.Cabins.Include(c => c.AmenityTags).Where(c => c.IsActive).ToListAsync(ct);

    public async Task<Cabin> AddAsync(Cabin cabin, CancellationToken ct = default)
    {
        db.Cabins.Add(cabin);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            throw new DuplicateCabinNameException(cabin.Name);
        }
        return cabin;
    }

    public async Task UpdateAsync(Cabin cabin, CancellationToken ct = default)
    {
        db.Cabins.Update(cabin);
        await db.SaveChangesAsync(ct);
    }
}
