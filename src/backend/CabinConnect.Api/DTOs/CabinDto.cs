namespace CabinConnect.Api.DTOs;

public record CabinDto(
    Guid Id,
    string Name,
    string Location,
    int Capacity,
    string? Description,
    Guid HostId,
    decimal BaseRate,
    bool IsActive,
    int Version,
    IReadOnlyList<AmenityTagDto> AmenityTags,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
