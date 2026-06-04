namespace CabinConnect.Api.DTOs;

public record CreateCabinRequest(
    string Name,
    string Location,
    int Capacity,
    string[] Amenities
);

public record CabinResponse(
    Guid Id,
    string Name,
    string Location,
    int Capacity,
    string[] Amenities,
    DateTime CreatedAt
);
