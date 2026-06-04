using System.ComponentModel.DataAnnotations;
using CabinConnect.Api.Domain.Enums;

namespace CabinConnect.Api.DTOs.Cabins;

public record UpdateCabinRequest
{
    [MaxLength(200, ErrorMessage = "Name must be 200 characters or fewer.")]
    public string? Name { get; init; }

    [MaxLength(500, ErrorMessage = "Location must be 500 characters or fewer.")]
    public string? Location { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
    public int? Capacity { get; init; }

    // null = no change; empty list = validation error (AC-4.4) — enforced in service
    public List<Amenity>? Amenities { get; init; }
}
