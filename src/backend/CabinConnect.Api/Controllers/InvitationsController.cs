using System.Security.Claims;
using System.Text.Json;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvitationsController(IInvitationService invitations) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvitationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!IsAuthenticated(out _))
            return Unauthorized();

        if (!IsSuperAdmin())
            return StatusCode(403);

        try
        {
            await invitations.InviteAsync(request.Email, request.Role, ct);
            return Ok(new { message = "Invitation sent." });
        }
        catch (UserAlreadyExistsException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (PendingInvitationExistsException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("{email}/resend")]
    public async Task<IActionResult> Resend(string email, CancellationToken ct)
    {
        if (!IsAuthenticated(out _))
            return Unauthorized();

        if (!IsSuperAdmin())
            return StatusCode(403);

        try
        {
            await invitations.ResendAsync(email, ct);
            return Ok(new { message = "Invitation resent." });
        }
        catch (InvitationNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{email}")]
    public async Task<IActionResult> Cancel(string email, CancellationToken ct)
    {
        if (!IsAuthenticated(out _))
            return Unauthorized();

        if (!IsSuperAdmin())
            return StatusCode(403);

        try
        {
            await invitations.CancelAsync(email, ct);
            return NoContent();
        }
        catch (InvitationNotFoundException)
        {
            return NotFound();
        }
    }

    private bool IsAuthenticated(out string sub)
    {
        sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
           ?? User.FindFirst("sub")?.Value
           ?? string.Empty;
        return !string.IsNullOrEmpty(sub);
    }

    private bool IsSuperAdmin()
    {
        if (User.HasClaim("app_role", "super_admin"))
            return true;

        var appMetadataJson = User.FindFirst("app_metadata")?.Value;
        if (appMetadataJson is null) return false;

        try
        {
            using var doc = JsonDocument.Parse(appMetadataJson);
            return doc.RootElement.TryGetProperty("role", out var role)
                && role.GetString() == "super_admin";
        }
        catch
        {
            return false;
        }
    }
}
