using CabinConnect.Api.Domain.Entities;
using CabinConnect.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Repositories;

public sealed class CabinRepository : ICabinRepository
{
    private readonly AppDbContext _db;

    public CabinRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Cabin>> ListByOwnerAsync(Guid ownerId, CancellationToken ct = default) =>
        await _db.Cabins
            .Include(c => c.Community)
            .Include(c => c.CabinAmenities).ThenInclude(ca => ca.Amenity)
            .Where(c => c.OwnerId == ownerId && !c.IsDeleted)
            .OrderByDescending(c => c.CreatedAt)
            .ThenBy(c => c.Id)
            .ToListAsync(ct);

    public async Task<Cabin?> GetByIdAndOwnerAsync(Guid id, Guid ownerId, CancellationToken ct = default) =>
        await _db.Cabins
            .Include(c => c.Community)
            .Include(c => c.CabinAmenities).ThenInclude(ca => ca.Amenity)
            .FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == ownerId && !c.IsDeleted, ct);

    public async Task<int> CountActiveByOwnerAsync(Guid ownerId, CancellationToken ct = default) =>
        await _db.Cabins
            .CountAsync(c => c.OwnerId == ownerId && !c.IsDeleted, ct);

    public async Task<Cabin> CreateAsync(Cabin cabin, CancellationToken ct = default)
    {
        // Transactional cap enforcement via serializable isolation (EC-001)
        await using var transaction = await _db.Database.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, ct);

        var activeCount = await CountActiveByOwnerAsync(cabin.OwnerId, ct);
        if (activeCount >= 10)
            throw new CabinCapExceededException(cabin.OwnerId);

        _db.Cabins.Add(cabin);
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        // Reload with navigation properties
        return (await GetByIdAndOwnerAsync(cabin.Id, cabin.OwnerId, ct))!;
    }

    public async Task<Cabin> UpdateAsync(Cabin cabin, CancellationToken ct = default)
    {
        _db.Cabins.Update(cabin);
        await _db.SaveChangesAsync(ct);
        return (await GetByIdAndOwnerAsync(cabin.Id, cabin.OwnerId, ct))!;
    }
}

public sealed class CabinCapExceededException : Exception
{
    public Guid OwnerId { get; }
    public CabinCapExceededException(Guid ownerId)
        : base($"Owner {ownerId} has reached the maximum cabin limit.")
    {
        OwnerId = ownerId;
    }
}
