using System.ComponentModel.DataAnnotations;

namespace CabinConnect.Api.DTOs;

public record CreateInvitationRequest(
    [Required][EmailAddress] string Email,
    [Required] string Role
);
