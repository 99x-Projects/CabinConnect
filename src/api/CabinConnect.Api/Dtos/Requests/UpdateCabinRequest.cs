using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.Dtos.Requests;

public sealed class UpdateCabinRequest
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
