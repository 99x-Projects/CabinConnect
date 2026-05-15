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
        var result = await cabins.GetAllActiveAsync(ct);
        return Ok(result.Select(CabinService.ToDto));
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

        var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
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
}
