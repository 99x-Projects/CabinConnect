using CabinConnect.Api.Application.Amenities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/amenities")]
[Authorize]
public sealed class AmenitiesController(AmenityService amenityService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AmenityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<AmenityResponse>>> GetAmenities(CancellationToken cancellationToken)
    {
        var amenities = await amenityService.GetCatalogAsync(cancellationToken);
        return Ok(amenities);
    }
}
