namespace CabinConnect.Api.Application.Cabins;

public sealed record UpdateCabinRequest(
    string Name,
    string Description,
    string StreetAddress,
    int Capacity,
    IReadOnlyList<Guid>? CatalogAmenityIds,
    IReadOnlyList<string>? CustomAmenities);
