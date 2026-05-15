using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/amenity-tags")]
[AllowAnonymous]
public class AmenityTagsController(IAmenityTagRepository tags) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await tags.GetAllOrderedByNameAsync(ct);
        return Ok(result.Select(t => new AmenityTagDto(t.Id, t.Name)));
    }
}
