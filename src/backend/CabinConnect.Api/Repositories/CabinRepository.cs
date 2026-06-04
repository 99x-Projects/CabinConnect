using CabinConnect.Api.Data;
using CabinConnect.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Repositories;

public class CabinRepository : ICabinRepository
{
    private readonly AppDbContext _db;

    public CabinRepository(AppDbContext db) => _db = db;

    public async Task<Cabin> CreateAsync(Cabin cabin, CancellationToken cancellationToken = default)
    {
        _db.Cabins.Add(cabin);
        await _db.SaveChangesAsync(cancellationToken);
        return cabin;
    }

    public async Task<IReadOnlyList<Cabin>> GetAllByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        // EC-007: filter by ownerId in the query — RLS on the DB also enforces this, but both layers are required
        return await _db.Cabins
            .Where(c => c.OwnerId == ownerId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Cabin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _db.Cabins.FindAsync([id], cancellationToken);
    }

    public async Task<Cabin> UpdateAsync(Cabin cabin, CancellationToken cancellationToken = default)
    {
        // Entity is already tracked from GetByIdAsync — SaveChanges picks up the mutations
        await _db.SaveChangesAsync(cancellationToken);
        return cabin;
    }
}
