using CabinConnect.Api.Domain.Entities;
using CabinConnect.Api.Dtos.Requests;
using CabinConnect.Api.Dtos.Responses;
using CabinConnect.Api.Infrastructure.Persistence;
using CabinConnect.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Services;

public sealed class CabinService
{
    private readonly ICabinRepository _repository;
    private readonly AppDbContext _db;

    public CabinService(ICabinRepository repository, AppDbContext db)
    {
        _repository = repository;
        _db = db;
    }

    public async Task<(CabinResponse cabin, string? error, int statusCode)> CreateAsync(
        Guid ownerId,
        CreateCabinRequest request,
        CancellationToken ct = default)
    {
        // Validate community exists (AC-4)
        var community = await _db.Communities.FindAsync([request.CommunityId], ct);
        if (community is null)
            return (null!, "Community not found.", 400);

        // Validate all amenity IDs exist in the controlled list (AC-5)
        if (request.AmenityIds.Count > 0)
        {
            var validIds = await _db.Amenities
                .Where(a => request.AmenityIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync(ct);

            var invalidIds = request.AmenityIds.Except(validIds).ToList();
            if (invalidIds.Count > 0)
                return (null!, $"Invalid amenity IDs: {string.Join(", ", invalidIds)}", 400);
        }

        // Create domain entity — owner_id from JWT, never request body (AC-7)
        var cabin = Cabin.Create(
            ownerId,
            request.Name.Trim(),
            request.Address.Street,
            request.Address.PostalCode,
            request.Address.City,
            string.IsNullOrWhiteSpace(request.Address.Country) ? "NO" : request.Address.Country,
            request.CommunityId,
            request.Capacity);

        try
        {
            var saved = await _repository.CreateAsync(cabin, ct);

            // Attach amenities after cabin is persisted
            if (request.AmenityIds.Count > 0)
            {
                var amenityLinks = request.AmenityIds
                    .Distinct()
                    .Select(aid => CabinAmenity.Create(saved.Id, aid));
                _db.CabinAmenities.AddRange(amenityLinks);
                await _db.SaveChangesAsync(ct);
            }

            // Reload to get full navigation properties
            var full = await _repository.GetByIdAndOwnerAsync(saved.Id, ownerId, ct);
            return (MapToResponse(full!), null, 201);
        }
        catch (CabinCapExceededException)
        {
            return (null!, "Cabin limit reached. Please contact support.", 409);
        }
    }

    public async Task<IReadOnlyList<CabinResponse>> ListByOwnerAsync(
        Guid ownerId,
        CancellationToken ct = default)
    {
        var cabins = await _repository.ListByOwnerAsync(ownerId, ct);
        return cabins.Select(MapToResponse).ToList();
    }

    public async Task<(CabinResponse? cabin, int statusCode)> GetByIdAsync(
        Guid id,
        Guid ownerId,
        CancellationToken ct = default)
    {
        var cabin = await _repository.GetByIdAndOwnerAsync(id, ownerId, ct);
        return cabin is null ? (null, 404) : (MapToResponse(cabin), 200);
    }

    public async Task<(CabinResponse? cabin, string? error, int statusCode)> UpdateAsync(
        Guid id,
        Guid ownerId,
        UpdateCabinRequest request,
        CancellationToken ct = default)
    {
        var cabin = await _repository.GetByIdAndOwnerAsync(id, ownerId, ct);
        if (cabin is null) return (null, "Cabin not found.", 404);

        var community = await _db.Communities.FindAsync([request.CommunityId], ct);
        if (community is null) return (null, "Community not found.", 400);

        if (request.AmenityIds.Count > 0)
        {
            var validIds = await _db.Amenities
                .Where(a => request.AmenityIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync(ct);

            var invalidIds = request.AmenityIds.Except(validIds).ToList();
            if (invalidIds.Count > 0)
                return (null, $"Invalid amenity IDs: {string.Join(", ", invalidIds)}", 400);
        }

        cabin.Update(
            request.Name.Trim(),
            request.Address.Street,
            request.Address.PostalCode,
            request.Address.City,
            string.IsNullOrWhiteSpace(request.Address.Country) ? "NO" : request.Address.Country,
            request.CommunityId,
            request.Capacity,
            ownerId);

        // Replace amenity set: clear old, attach new
        cabin.ClearAmenities();
        _db.CabinAmenities.RemoveRange(_db.CabinAmenities.Where(ca => ca.CabinId == id));
        await _db.SaveChangesAsync(ct);

        if (request.AmenityIds.Count > 0)
        {
            var amenityLinks = request.AmenityIds.Distinct().Select(aid => CabinAmenity.Create(id, aid));
            _db.CabinAmenities.AddRange(amenityLinks);
        }

        var saved = await _repository.UpdateAsync(cabin, ct);
        return (MapToResponse(saved), null, 200);
    }

    public async Task<(string? error, int statusCode)> DeleteAsync(
        Guid id,
        Guid ownerId,
        CancellationToken ct = default)
    {
        var cabin = await _repository.GetByIdAndOwnerAsync(id, ownerId, ct);
        if (cabin is null) return ("Cabin not found.", 404);

        cabin.SoftDelete(ownerId);
        await _repository.UpdateAsync(cabin, ct);
        return (null, 204);
    }

    public static CabinResponse MapToResponse(Cabin cabin) => new()
    {
        Id = cabin.Id,
        Name = cabin.Name,
        Address = new()
        {
            Street = cabin.Street,
            PostalCode = cabin.PostalCode,
            City = cabin.City,
            Country = cabin.Country,
        },
        Community = new()
        {
            Id = cabin.Community.Id,
            Name = cabin.Community.Name,
            Region = cabin.Community.Region,
        },
        Capacity = cabin.Capacity,
        Amenities = cabin.CabinAmenities
            .Select(ca => new AmenityResponse { Id = ca.Amenity.Id, Name = ca.Amenity.Name })
            .ToList(),
        CreatedAt = cabin.CreatedAt,
        UpdatedAt = cabin.UpdatedAt,
    };
}
