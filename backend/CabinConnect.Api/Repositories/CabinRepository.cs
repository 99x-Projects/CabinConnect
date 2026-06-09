using CabinConnect.Api.Data;
using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Repositories;

public class CabinRepository : ICabinRepository
{
    private readonly CabinConnectDbContext _db;

    public CabinRepository(CabinConnectDbContext db)
    {
        _db = db;
    }

    public async Task<Cabin> CreateAsync(Cabin cabin, CancellationToken cancellationToken = default)
    {
        _db.Cabins.Add(cabin);
        await _db.SaveChangesAsync(cancellationToken);
        return cabin;
    }
}
