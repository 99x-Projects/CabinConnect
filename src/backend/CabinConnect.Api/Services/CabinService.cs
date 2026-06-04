using CabinConnect.Api.Domain;
using CabinConnect.Api.DTOs.Cabins;
using CabinConnect.Api.Repositories;

namespace CabinConnect.Api.Services;

public class CabinService : ICabinService
{
    private readonly ICabinRepository _cabinRepository;

    public CabinService(ICabinRepository cabinRepository) => _cabinRepository = cabinRepository;

    public async Task<CabinDto> CreateCabinAsync(Guid ownerId, CreateCabinRequest request, CancellationToken cancellationToken = default)
    {
        var cabin = Cabin.Create(
            ownerId,
            request.Name,
            request.Location,
            request.Capacity,
            request.Amenities
        );

        var created = await _cabinRepository.CreateAsync(cabin, cancellationToken);
        return MapToDto(created);
    }

    public async Task<IReadOnlyList<CabinDto>> GetCabinsAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        var cabins = await _cabinRepository.GetAllByOwnerAsync(ownerId, cancellationToken);
        return cabins.Select(MapToDto).ToList();
    }

    public async Task<CabinDto?> UpdateCabinAsync(Guid ownerId, Guid cabinId, UpdateCabinRequest request, CancellationToken cancellationToken = default)
    {
        // AC-4.4: amenities provided but empty is a business rule violation
        if (request.Amenities is not null && request.Amenities.Count == 0)
            throw new ArgumentException("At least one amenity is required.");

        var cabin = await _cabinRepository.GetByIdAsync(cabinId, cancellationToken);
        if (cabin is null) return null;

        // EC-007: validate ownership before any mutation
        if (cabin.OwnerId != ownerId) throw new UnauthorizedAccessException();

        cabin.Update(request.Name, request.Location, request.Capacity, request.Amenities);
        var updated = await _cabinRepository.UpdateAsync(cabin, cancellationToken);
        return MapToDto(updated);
    }

    public async Task<CabinDto?> SetCabinStatusAsync(Guid ownerId, Guid cabinId, CabinStatusAction action, CancellationToken cancellationToken = default)
    {
        var cabin = await _cabinRepository.GetByIdAsync(cabinId, cancellationToken);
        if (cabin is null) return null;

        // EC-007: ownership before any write
        if (cabin.OwnerId != ownerId) throw new UnauthorizedAccessException();

        // Idempotent: calling Deactivate on an already-Inactive cabin (or Reactivate on Active) is a no-op (AC-5.3, AC-5.4)
        if (action == CabinStatusAction.Deactivate)
            cabin.Deactivate();
        else
            cabin.Reactivate();

        var updated = await _cabinRepository.UpdateAsync(cabin, cancellationToken);
        return MapToDto(updated);
    }

    public async Task<CabinDto?> GetCabinAsync(Guid ownerId, Guid cabinId, CancellationToken cancellationToken = default)
    {
        var cabin = await _cabinRepository.GetByIdAsync(cabinId, cancellationToken);

        if (cabin is null) return null;

        // EC-007: ownership check after fetch — return null to signal 403, not 404
        if (cabin.OwnerId != ownerId) throw new UnauthorizedAccessException();

        return MapToDto(cabin);
    }

    private static CabinDto MapToDto(Cabin cabin) => new(
        cabin.Id,
        cabin.OwnerId,
        cabin.Name,
        cabin.Location,
        cabin.Capacity,
        cabin.Amenities,
        cabin.Status
    );
}
