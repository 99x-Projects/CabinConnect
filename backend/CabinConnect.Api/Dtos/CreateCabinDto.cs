using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.Dtos;

public class CreateCabinDto
{
    [Required]
    public string? Name { get; set; }

    [Required]
    public string? Description { get; set; }

    [Required]
    public string? Location { get; set; }

    [Required]
    public decimal? BaseRate { get; set; }

    [Required]
    public int? MaxGuests { get; set; }
}
