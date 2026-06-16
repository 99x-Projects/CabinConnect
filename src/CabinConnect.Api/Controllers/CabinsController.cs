using System.Security.Claims;
using CabinConnect.Api.Application.Cabins;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/cabins")]
[Authorize]
public sealed class CabinsController(CabinRegistrationService cabinRegistrationService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CabinResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<CabinResponse>>> ListCabins(CancellationToken cancellationToken)
    {
        if (!TryGetHostId(out var hostId))
        {
            return Unauthorized();
        }

        var cabins = await cabinRegistrationService.ListForHostAsync(hostId, cancellationToken);
        return Ok(cabins);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CabinResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CabinResponse>> RegisterCabin(
        [FromBody] RegisterCabinRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetHostId(out var hostId))
        {
            return Unauthorized();
        }

        var (cabin, error) = await cabinRegistrationService.RegisterAsync(hostId, request, cancellationToken);
        if (error is not null)
        {
            return BadRequest(new { error });
        }

        return CreatedAtAction(nameof(GetCabin), new { id = cabin!.Id }, cabin);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CabinResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CabinResponse>> GetCabin(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetHostId(out var hostId))
        {
            return Unauthorized();
        }

        var cabin = await cabinRegistrationService.GetForHostAsync(id, hostId, cancellationToken);
        if (cabin is null)
        {
            return NotFound();
        }

        return Ok(cabin);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeactivateCabin(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetHostId(out var hostId))
        {
            return Unauthorized();
        }

        var found = await cabinRegistrationService.DeactivateForHostAsync(id, hostId, cancellationToken);
        return found ? NoContent() : NotFound();
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CabinResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CabinResponse>> UpdateCabin(
        Guid id,
        [FromBody] UpdateCabinRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetHostId(out var hostId))
        {
            return Unauthorized();
        }

        var (cabin, error) = await cabinRegistrationService.UpdateForHostAsync(id, hostId, request, cancellationToken);
        if (error is not null)
        {
            return BadRequest(new { error });
        }

        if (cabin is null)
        {
            return NotFound();
        }

        return Ok(cabin);
    }

    private bool TryGetHostId(out Guid hostId)
    {
        hostId = default;
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return !string.IsNullOrWhiteSpace(subject) && Guid.TryParse(subject, out hostId);
    }
}
