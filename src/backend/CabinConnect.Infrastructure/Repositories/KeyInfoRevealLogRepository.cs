using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;

namespace CabinConnect.Infrastructure.Repositories;

public class KeyInfoRevealLogRepository(AppDbContext db) : IKeyInfoRevealLogRepository
{
    public async Task LogAsync(KeyInfoRevealLog entry, CancellationToken ct = default)
    {
        db.KeyInfoRevealLogs.Add(entry);
        await db.SaveChangesAsync(ct);
    }
}
