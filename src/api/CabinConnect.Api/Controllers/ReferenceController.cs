using CabinConnect.Api.Dtos.Responses;
using CabinConnect.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Controllers;

/// <summary>Public read-only reference data endpoints. No auth required.</summary>
[ApiController]
[Route("api/reference")]
[AllowAnonymous]
public sealed class ReferenceController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReferenceController(AppDbContext db) => _db = db;

    [HttpGet("communities")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCommunities(CancellationToken ct)
    {
        var communities = await _db.Communities
            .OrderBy(c => c.Name)
            .Select(c => new CommunityResponse { Id = c.Id, Name = c.Name, Region = c.Region })
            .ToListAsync(ct);
        return Ok(communities);
    }

    [HttpGet("amenities")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAmenities(CancellationToken ct)
    {
        var amenities = await _db.Amenities
            .OrderBy(a => a.Name)
            .Select(a => new AmenityResponse { Id = a.Id, Name = a.Name })
            .ToListAsync(ct);
        return Ok(amenities);
    }
}
