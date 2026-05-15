using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;

namespace CabinConnect.Api.Services;

public class CabinService(ICabinRepository cabins, IAmenityTagRepository amenityTags) : ICabinService
{
    public async Task<CabinDto> CreateAsync(Guid hostId, CreateCabinRequest request, CancellationToken ct = default)
    {
        var tagIds = request.AmenityTagIds ?? [];
        List<AmenityTag> resolvedTags = [];

        if (tagIds.Count > 0)
        {
            resolvedTags = [.. await amenityTags.GetByIdsAsync(tagIds, ct)];
            var invalidIds = tagIds.Except(resolvedTags.Select(t => t.Id)).ToList();
            if (invalidIds.Count > 0)
                throw new InvalidAmenityTagsException(invalidIds);
        }

        var cabin = new Cabin
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Location = request.Location,
            Capacity = request.Capacity,
            Description = request.Description,
            HostId = hostId,
            BaseRate = 0,
            IsActive = true,
            Version = 1,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            AmenityTags = resolvedTags
        };

        var created = await cabins.AddAsync(cabin, ct);
        return ToDto(created);
    }

    public async Task<CabinDto> UpdateAsync(Guid hostId, Guid cabinId, UpdateCabinRequest request, CancellationToken ct = default)
    {
        var cabin = await cabins.GetByIdAsync(cabinId, ct)
            ?? throw new CabinNotFoundException(cabinId);

        if (cabin.HostId != hostId)
            throw new CabinOwnershipException(cabinId);

        if (cabin.Version != request.Version)
            throw new CabinVersionConflictException(cabinId, cabin.Version);

        var tagIds = request.AmenityTagIds ?? [];
        List<AmenityTag> resolvedTags = [];

        if (tagIds.Count > 0)
        {
            resolvedTags = [.. await amenityTags.GetByIdsAsync(tagIds, ct)];
            var invalidIds = tagIds.Except(resolvedTags.Select(t => t.Id)).ToList();
            if (invalidIds.Count > 0)
                throw new InvalidAmenityTagsException(invalidIds);
        }

        cabin.Name = request.Name;
        cabin.Location = request.Location;
        cabin.Capacity = request.Capacity;
        cabin.Description = request.Description;
        cabin.AmenityTags.Clear();
        foreach (var tag in resolvedTags)
            cabin.AmenityTags.Add(tag);
        cabin.Version++;
        cabin.UpdatedAt = DateTimeOffset.UtcNow;

        await cabins.UpdateAsync(cabin, ct);
        return ToDto(cabin);
    }

    internal static CabinDto ToDto(Cabin cabin) => new(
        cabin.Id,
        cabin.Name,
        cabin.Location,
        cabin.Capacity,
        cabin.Description,
        cabin.HostId,
        cabin.BaseRate,
        cabin.IsActive,
        cabin.Version,
        cabin.AmenityTags.Select(t => new AmenityTagDto(t.Id, t.Name)).ToList(),
        cabin.CreatedAt,
        cabin.UpdatedAt
    );
}
