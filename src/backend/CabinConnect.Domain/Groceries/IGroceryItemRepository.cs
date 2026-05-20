namespace CabinConnect.Domain.Groceries;

public interface IGroceryItemRepository
{
    Task<IReadOnlyList<GroceryItem>> GetAvailableAsync(string? category, CancellationToken cancellationToken);
}
