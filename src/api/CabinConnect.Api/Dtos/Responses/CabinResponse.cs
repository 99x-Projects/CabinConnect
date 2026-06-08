namespace CabinConnect.Api.Dtos.Responses;

public sealed class CabinResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public AddressResponse Address { get; init; } = new();
    public CommunityResponse Community { get; init; } = new();
    public int Capacity { get; init; }
    public IReadOnlyList<AmenityResponse> Amenities { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class AddressResponse
{
    public string Street { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
}

public sealed class CommunityResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Region { get; init; } = string.Empty;
}

public sealed class AmenityResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
