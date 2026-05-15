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
public class CabinsController(ICabinRepository cabins, ICabinService cabinService, ICabinKeyInfoService keyInfoService) : ControllerBase
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
    public async Task<IActionResult> GetById(Guid id, [FromQuery] bool reveal = false, CancellationToken ct = default)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        var cabin = await cabins.GetByIdAsync(id, ct);
        if (cabin is null) return NotFound();
        if (cabin.HostId != hostId) return StatusCode(403);

        var keyInfo = await keyInfoService.GetAsync(hostId, id, reveal, ct);

        return Ok(new CabinDetailDto(
            cabin.Id,
            cabin.Name,
            cabin.Location,
            cabin.Capacity,
            cabin.Description,
            cabin.HostId,
            cabin.BaseRate,
            cabin.IsActive,
            cabin.Version,
            cabin.AmenityTags.Select(t => new AmenityTagDto(t.Id, t.Name)).ToList(),
            keyInfo,
            cabin.CreatedAt,
            cabin.UpdatedAt));
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

    [HttpGet("{id:guid}/key-info")]
    public async Task<IActionResult> GetKeyInfo(Guid id, [FromQuery] bool reveal = false, CancellationToken ct = default)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        try
        {
            var dto = await keyInfoService.GetAsync(hostId, id, reveal, ct);
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
    }

    [HttpPut("{id:guid}/key-info")]
    public async Task<IActionResult> UpsertKeyInfo(Guid id, [FromBody] UpsertKeyInfoRequest request, CancellationToken ct)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(sub, out var hostId))
            return Unauthorized();

        try
        {
            var dto = await keyInfoService.UpsertAsync(hostId, id, request, ct);
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
    }
}
