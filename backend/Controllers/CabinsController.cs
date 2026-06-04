using System.Security.Claims;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Models;
using CabinConnect.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CabinsController : ControllerBase
{
    private readonly ICabinRepository _cabinRepository;

    public CabinsController(ICabinRepository cabinRepository)
    {
        _cabinRepository = cabinRepository;
    }

    [HttpPost]
    public async Task<ActionResult<CabinResponse>> Create([FromBody] CreateCabinRequest request)
    {
        var ownerId = GetUserId();
        if (ownerId == null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            ModelState.AddModelError(nameof(request.Name), "Name is required");
        }

        if (string.IsNullOrWhiteSpace(request.Location))
        {
            ModelState.AddModelError(nameof(request.Location), "Location is required");
        }

        if (request.Capacity < 1)
        {
            ModelState.AddModelError(nameof(request.Capacity), "Capacity must be at least 1");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var cabin = new Cabin
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            Capacity = request.Capacity,
            Amenities = request.Amenities ?? [],
            OwnerId = ownerId.Value,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _cabinRepository.CreateAsync(cabin);

        return CreatedAtAction(nameof(GetMyCabins), null, MapToResponse(created));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CabinResponse>>> GetMyCabins()
    {
        var ownerId = GetUserId();
        if (ownerId == null)
        {
            return Unauthorized();
        }

        var cabins = await _cabinRepository.GetByOwnerIdAsync(ownerId.Value);
        return Ok(cabins.Select(MapToResponse));
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (Guid.TryParse(sub, out var userId))
        {
            return userId;
        }

        return null;
    }

    private static CabinResponse MapToResponse(Cabin cabin)
    {
        return new CabinResponse(
            cabin.Id,
            cabin.Name,
            cabin.Location,
            cabin.Capacity,
            cabin.Amenities,
            cabin.CreatedAt
        );
    }
}
