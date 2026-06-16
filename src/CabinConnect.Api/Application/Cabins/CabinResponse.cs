using CabinConnect.Api.Application.Amenities;

namespace CabinConnect.Api.Application.Cabins;

public sealed record CabinResponse(
    Guid Id,
    string Name,
    string Description,
    string StreetAddress,
    int Capacity,
    bool IsActive,
    IReadOnlyList<AmenityResponse> CatalogAmenities,
    IReadOnlyList<string> CustomAmenities);
