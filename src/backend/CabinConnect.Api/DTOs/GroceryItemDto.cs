using CabinConnect.Domain.Groceries;

namespace CabinConnect.Api.DTOs;

public sealed record GroceryItemDto(
    Guid Id,
    string Name,
    string? Description,
    decimal UnitPrice,
    string Category,
    string Unit)
{
    public static GroceryItemDto FromDomain(GroceryItem item) =>
        new(item.Id, item.Name, item.Description, item.UnitPrice, item.Category, item.Unit);
}
