using CabinConnect.Api.Domain;
using CabinConnect.Api.Dtos;
using CabinConnect.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("cabins")]
[Authorize]
public class CabinsController : ControllerBase
{
    private readonly ICabinRepository _cabinRepository;
    private readonly ILogger<CabinsController> _logger;

    public CabinsController(ICabinRepository cabinRepository, ILogger<CabinsController> logger)
    {
        _cabinRepository = cabinRepository;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCabinDto dto, CancellationToken cancellationToken)
    {
        // [Required] on the DTO handles null/empty via [ApiController] auto-400.
        // These manual checks cover whitespace-only strings and range violations.
        var errors = new Dictionary<string, string>();

        if (string.IsNullOrWhiteSpace(dto.Name))
            errors["name"] = "Name is required.";
        if (string.IsNullOrWhiteSpace(dto.Description))
            errors["description"] = "Description is required.";
        if (string.IsNullOrWhiteSpace(dto.Location))
            errors["location"] = "Location is required.";
        if (dto.BaseRate.HasValue && dto.BaseRate.Value <= 0)
            errors["base_rate"] = "Base rate must be greater than zero.";
        if (dto.MaxGuests.HasValue && dto.MaxGuests.Value < 1)
            errors["max_guests"] = "Max guests must be at least 1.";

        if (errors.Count > 0)
            return BadRequest(new { errors });

        var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(hostIdClaim, out var hostId))
            return Unauthorized();

        var cabin = new Cabin
        {
            HostId = hostId,
            Name = dto.Name!.Trim(),
            Description = dto.Description!.Trim(),
            Location = dto.Location!.Trim(),
            BaseRate = dto.BaseRate!.Value,
            MaxGuests = dto.MaxGuests!.Value
        };

        try
        {
            var saved = await _cabinRepository.CreateAsync(cabin, cancellationToken);

            var response = new CabinDto
            {
                Id = saved.Id,
                HostId = saved.HostId,
                Name = saved.Name,
                Description = saved.Description,
                Location = saved.Location,
                BaseRate = saved.BaseRate,
                MaxGuests = saved.MaxGuests,
                CreatedAt = saved.CreatedAt
            };

            return Created($"/cabins/{saved.Id}", response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create cabin for host {HostId}", hostId);
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}
