using System.ComponentModel.DataAnnotations;
using CabinConnect.Api.Domain.Enums;

namespace CabinConnect.Api.DTOs.Cabins;

public record CreateCabinRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(200, ErrorMessage = "Name must be 200 characters or fewer.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Location is required.")]
    [MaxLength(500, ErrorMessage = "Location must be 500 characters or fewer.")]
    public string Location { get; init; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
    public int Capacity { get; init; }

    [Required(ErrorMessage = "At least one amenity is required.")]
    [MinLength(1, ErrorMessage = "At least one amenity is required.")]
    public List<Amenity> Amenities { get; init; } = new();
}
