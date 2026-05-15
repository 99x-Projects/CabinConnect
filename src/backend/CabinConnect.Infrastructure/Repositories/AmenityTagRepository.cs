using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Repositories;

public class AmenityTagRepository(AppDbContext db) : IAmenityTagRepository
{
    public async Task<IReadOnlyList<AmenityTag>> GetAllOrderedByNameAsync(CancellationToken ct = default) =>
        await db.AmenityTags.OrderBy(t => t.Name).ToListAsync(ct);
}
