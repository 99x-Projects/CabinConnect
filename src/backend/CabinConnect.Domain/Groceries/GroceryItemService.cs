namespace CabinConnect.Domain.Groceries;

public sealed class GroceryItemService : IGroceryItemService
{
    private readonly IGroceryItemRepository _repository;

    public GroceryItemService(IGroceryItemRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<GroceryItem>> GetCatalogAsync(string? category, CancellationToken cancellationToken)
        => _repository.GetAvailableAsync(category, cancellationToken);
}
