using CabinConnect.Api.Domain.Enums;

namespace CabinConnect.Api.DTOs.Cabins;

public record CabinDto(
    Guid Id,
    Guid OwnerId,
    string Name,
    string Location,
    int Capacity,
    List<Amenity> Amenities,
    CabinStatus Status
);
