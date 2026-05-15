using CabinConnect.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CabinsController(ICabinRepository cabins) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await cabins.GetAllActiveAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var cabin = await cabins.GetByIdAsync(id, ct);
        return cabin is null ? NotFound() : Ok(cabin);
    }
}
