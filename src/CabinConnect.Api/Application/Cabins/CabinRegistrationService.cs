using CabinConnect.Api.Application.Amenities;
using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Application.Cabins;

public sealed class CabinRegistrationService(
    ICabinRepository cabinRepository,
    IAmenityRepository amenityRepository)
{
    public async Task<(CabinResponse? Cabin, string? Error)> RegisterAsync(
        Guid hostId,
        RegisterCabinRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = ValidateRequest(request);
        if (validationError is not null)
        {
            return (null, validationError);
        }

        var catalogAmenityIds = request.CatalogAmenityIds?.Distinct().ToArray() ?? [];
        var customAmenities = request.CustomAmenities?
            .Select(value => value.Trim())
            .Where(value => value.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];

        if (catalogAmenityIds.Length + customAmenities.Length == 0)
        {
            return (null, "At least one catalog or custom amenity is required.");
        }

        if (catalogAmenityIds.Length > 0 &&
            !await amenityRepository.AllExistAsync(catalogAmenityIds, cancellationToken))
        {
            return (null, "One or more catalog amenity identifiers do not exist.");
        }

        var cabin = await cabinRepository.CreateAsync(
            hostId,
            request.Name.Trim(),
            request.Description.Trim(),
            request.StreetAddress.Trim(),
            request.Capacity,
            catalogAmenityIds,
            customAmenities,
            cancellationToken);

        return (MapToResponse(cabin), null);
    }

    /// <summary>
    /// Returns true if deactivation succeeded, false if the Cabin was not found or
    /// belongs to a different Host. Idempotent: deactivating an already-inactive Cabin succeeds.
    /// Per EC-011: existing bookings are unaffected; the booking layer must filter inactive cabins.
    /// </summary>
    public async Task<bool> DeactivateForHostAsync(
        Guid cabinId,
        Guid hostId,
        CancellationToken cancellationToken)
    {
        return await cabinRepository.DeactivateAsync(cabinId, hostId, cancellationToken);
    }

    public async Task<(CabinResponse? Cabin, string? Error)> UpdateForHostAsync(
        Guid cabinId,
        Guid hostId,
        UpdateCabinRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = ValidateFields(request.Name, request.Description, request.StreetAddress, request.Capacity);
        if (validationError is not null)
        {
            return (null, validationError);
        }

        var catalogAmenityIds = request.CatalogAmenityIds?.Distinct().ToArray() ?? [];
        var customAmenities = request.CustomAmenities?
            .Select(v => v.Trim())
            .Where(v => v.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];

        if (catalogAmenityIds.Length + customAmenities.Length == 0)
        {
            return (null, "At least one catalog or custom amenity is required.");
        }

        if (catalogAmenityIds.Length > 0 &&
            !await amenityRepository.AllExistAsync(catalogAmenityIds, cancellationToken))
        {
            return (null, "One or more catalog amenity identifiers do not exist.");
        }

        var cabin = await cabinRepository.UpdateAsync(
            cabinId,
            hostId,
            request.Name.Trim(),
            request.Description.Trim(),
            request.StreetAddress.Trim(),
            request.Capacity,
            catalogAmenityIds,
            customAmenities,
            cancellationToken);

        return cabin is null ? (null, null) : (MapToResponse(cabin), null);
    }

    public async Task<IReadOnlyList<CabinResponse>> ListForHostAsync(
        Guid hostId,
        CancellationToken cancellationToken)
    {
        var cabins = await cabinRepository.GetAllForHostAsync(hostId, cancellationToken);
        return cabins.Select(MapToResponse).ToArray();
    }

    public async Task<CabinResponse?> GetForHostAsync(
        Guid cabinId,
        Guid hostId,
        CancellationToken cancellationToken)
    {
        var cabin = await cabinRepository.GetByIdForHostAsync(cabinId, hostId, cancellationToken);
        return cabin is null ? null : MapToResponse(cabin);
    }

    private static string? ValidateRequest(RegisterCabinRequest request) =>
        ValidateFields(request.Name, request.Description, request.StreetAddress, request.Capacity);

    private static string? ValidateFields(string name, string description, string streetAddress, int capacity)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Name is required.";
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            return "Description is required.";
        }

        if (string.IsNullOrWhiteSpace(streetAddress))
        {
            return "Street address is required.";
        }

        if (capacity < CabinCapacityLimits.Minimum || capacity > CabinCapacityLimits.Maximum)
        {
            return $"Capacity must be between {CabinCapacityLimits.Minimum} and {CabinCapacityLimits.Maximum}.";
        }

        return null;
    }

    private static CabinResponse MapToResponse(Cabin cabin) =>
        new(
            cabin.Id,
            cabin.Name,
            cabin.Description,
            cabin.StreetAddress,
            cabin.Capacity,
            cabin.IsActive,
            cabin.CatalogAmenities
                .Select(amenity => new AmenityResponse(amenity.Id, amenity.DisplayName))
                .ToArray(),
            cabin.CustomAmenities);
}
