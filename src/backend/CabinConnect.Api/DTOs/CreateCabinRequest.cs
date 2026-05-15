using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.DTOs;

public record CreateCabinRequest(
    [Required][MaxLength(512)] string Name,
    [Required] string Location,
    [Range(1, int.MaxValue)] int Capacity,
    string? Description,
    IReadOnlyList<Guid>? AmenityTagIds
);
