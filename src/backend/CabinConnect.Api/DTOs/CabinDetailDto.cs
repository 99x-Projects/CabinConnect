namespace CabinConnect.Api.DTOs;

public record CabinDetailDto(
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
    KeyInfoDto KeyInfo,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
