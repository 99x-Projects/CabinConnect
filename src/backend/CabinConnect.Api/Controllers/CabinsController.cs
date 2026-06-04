using System.Security.Claims;
using CabinConnect.Api.DTOs.Cabins;
using CabinConnect.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CabinsController : ControllerBase
{
    private readonly ICabinService _cabinService;

    public CabinsController(ICabinService cabinService) => _cabinService = cabinService;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        // Owner ID from JWT — never from query string (EC-007)
        var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (ownerIdClaim is null || !Guid.TryParse(ownerIdClaim, out var ownerId))
            return Unauthorized();

        var cabins = await _cabinService.GetCabinsAsync(ownerId, cancellationToken);
        return Ok(new { data = cabins, error = (string?)null });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (ownerIdClaim is null || !Guid.TryParse(ownerIdClaim, out var ownerId))
            return Unauthorized();

        try
        {
            var cabin = await _cabinService.GetCabinAsync(ownerId, id, cancellationToken);
            if (cabin is null) return NotFound(new { data = (object?)null, error = "Cabin not found." });
            return Ok(new { data = cabin, error = (string?)null });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { data = (object?)null, error = "You do not own this cabin." });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCabinRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // EC-007: owner ID from JWT only — never from request body
        var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (ownerIdClaim is null || !Guid.TryParse(ownerIdClaim, out var ownerId))
            return Unauthorized();

        try
        {
            var cabin = await _cabinService.UpdateCabinAsync(ownerId, id, request, cancellationToken);
            if (cabin is null) return NotFound(new { data = (object?)null, error = "Cabin not found." });
            return Ok(new { data = cabin, error = (string?)null });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { data = (object?)null, error = "You do not own this cabin." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { data = (object?)null, error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(
        Guid id,
        [FromBody] SetCabinStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (ownerIdClaim is null || !Guid.TryParse(ownerIdClaim, out var ownerId))
            return Unauthorized();

        try
        {
            var cabin = await _cabinService.SetCabinStatusAsync(ownerId, id, request.Action, cancellationToken);
            if (cabin is null) return NotFound(new { data = (object?)null, error = "Cabin not found." });
            return Ok(new { data = cabin, error = (string?)null });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { data = (object?)null, error = "You do not own this cabin." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCabinRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Owner ID must come from the validated JWT — never from the request body (EC-007)
        var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (ownerIdClaim is null || !Guid.TryParse(ownerIdClaim, out var ownerId))
            return Unauthorized();

        var cabin = await _cabinService.CreateCabinAsync(ownerId, request, cancellationToken);

        return CreatedAtAction(
            nameof(Create),
            new { id = cabin.Id },
            new { data = cabin, error = (string?)null });
    }
}
