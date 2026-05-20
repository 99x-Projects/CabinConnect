namespace CabinConnect.Domain.Groceries;

public interface IGroceryItemService
{
    Task<IReadOnlyList<GroceryItem>> GetCatalogAsync(string? category, CancellationToken cancellationToken);
}
