using System.Security.Claims;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CabinsController(ICabinRepository cabins, ICabinService cabinService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        var result = await cabinService.GetByHostAsync(hostId, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var cabin = await cabins.GetByIdAsync(id, ct);
        return cabin is null ? NotFound() : Ok(CabinService.ToDto(cabin));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCabinRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        try
        {
            var dto = await cabinService.CreateAsync(hostId, request, ct);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (InvalidAmenityTagsException ex)
        {
            return BadRequest(new { error = ex.Message, invalidIds = ex.InvalidIds });
        }
        catch (DuplicateCabinNameException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCabinRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        try
        {
            var dto = await cabinService.UpdateAsync(hostId, id, request, ct);
            return Ok(dto);
        }
        catch (CabinNotFoundException)
        {
            return NotFound();
        }
        catch (CabinOwnershipException)
        {
            return StatusCode(403);
        }
        catch (CabinVersionConflictException ex)
        {
            return Conflict(new { error = ex.Message, currentVersion = ex.CurrentVersion });
        }
        catch (InvalidAmenityTagsException ex)
        {
            return BadRequest(new { error = ex.Message, invalidIds = ex.InvalidIds });
        }
        catch (DuplicateCabinNameException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
