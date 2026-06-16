namespace CabinConnect.Api.Domain;

public sealed record Cabin(
    Guid Id,
    Guid HostId,
    string Name,
    string Description,
    string StreetAddress,
    int Capacity,
    bool IsActive,
    IReadOnlyList<Amenity> CatalogAmenities,
    IReadOnlyList<string> CustomAmenities);
