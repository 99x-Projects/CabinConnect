using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.Dtos.Requests;

public sealed class CreateCabinRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public AddressRequest Address { get; init; } = new();

    [Required]
    public Guid CommunityId { get; init; }

    [Range(1, 50)]
    public int Capacity { get; init; }

    public IReadOnlyList<Guid> AmenityIds { get; init; } = [];
}

public sealed class AddressRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Street { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string PostalCode { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string City { get; init; } = string.Empty;

    [StringLength(200)]
    public string Country { get; init; } = "NO";
}
