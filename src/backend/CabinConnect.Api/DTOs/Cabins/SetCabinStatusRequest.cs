using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.DTOs.Cabins;

public enum CabinStatusAction { Deactivate, Reactivate }

public record SetCabinStatusRequest
{
    [Required]
    public CabinStatusAction Action { get; init; }
}
