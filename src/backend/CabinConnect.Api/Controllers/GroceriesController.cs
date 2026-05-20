using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Groceries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("api/groceries")]
[Authorize]
public sealed class GroceriesController : ControllerBase
{
    private readonly IGroceryItemService _groceryItemService;

    public GroceriesController(IGroceryItemService groceryItemService)
    {
        _groceryItemService = groceryItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCatalog(
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        var items = await _groceryItemService.GetCatalogAsync(category, cancellationToken);
        return Ok(new { data = items.Select(GroceryItemDto.FromDomain), error = (string?)null });
    }
}
