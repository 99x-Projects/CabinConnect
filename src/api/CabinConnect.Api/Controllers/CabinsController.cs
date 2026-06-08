using CabinConnect.Api.Dtos.Requests;
using CabinConnect.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/cabins")]
[Authorize]
public sealed class CabinsController : ControllerBase
{
    private readonly CabinService _service;

    public CabinsController(CabinService service) => _service = service;

    private Guid? GetOwnerId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>Lists all active cabins owned by the authenticated user.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        if (GetOwnerId() is not Guid ownerId) return Unauthorized();
        var cabins = await _service.ListByOwnerAsync(ownerId, ct);
        return Ok(cabins);
    }

    /// <summary>Returns a single cabin by ID, scoped to the authenticated owner.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        if (GetOwnerId() is not Guid ownerId) return Unauthorized();
        var (cabin, statusCode) = await _service.GetByIdAsync(id, ownerId, ct);
        return statusCode == 200 ? Ok(cabin) : NotFound();
    }

    /// <summary>Creates a new cabin for the authenticated owner.</summary>
    /// <response code="201">Cabin created successfully.</response>
    /// <response code="400">Validation error — see problem details.</response>
    /// <response code="401">Unauthenticated.</response>
    /// <response code="409">Owner cabin cap reached.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCabinRequest request,
        CancellationToken ct)
    {
        if (GetOwnerId() is not Guid ownerId) return Unauthorized();

        var (cabin, error, statusCode) = await _service.CreateAsync(ownerId, request, ct);

        return statusCode switch
        {
            201 => CreatedAtAction(nameof(GetById), new { id = cabin.Id }, cabin),
            409 => Conflict(new ProblemDetails { Title = error, Status = 409 }),
            _ => BadRequest(new ProblemDetails { Title = error, Status = 400 }),
        };
    }

    /// <summary>Updates an existing cabin owned by the authenticated user.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCabinRequest request,
        CancellationToken ct)
    {
        if (GetOwnerId() is not Guid ownerId) return Unauthorized();
        var (cabin, error, statusCode) = await _service.UpdateAsync(id, ownerId, request, ct);
        return statusCode switch
        {
            200 => Ok(cabin),
            404 => NotFound(),
            _ => BadRequest(new ProblemDetails { Title = error, Status = statusCode }),
        };
    }

    /// <summary>Soft-deletes a cabin owned by the authenticated user.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (GetOwnerId() is not Guid ownerId) return Unauthorized();
        var (error, statusCode) = await _service.DeleteAsync(id, ownerId, ct);
        return statusCode switch
        {
            204 => NoContent(),
            _ => NotFound(new ProblemDetails { Title = error, Status = 404 }),
        };
    }
}
