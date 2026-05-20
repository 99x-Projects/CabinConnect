namespace CabinConnect.Domain.Groceries;

public sealed class GroceryItem
{
    public Guid Id { get; }
    public string Name { get; }
    public string? Description { get; }
    public decimal UnitPrice { get; }
    public string Category { get; }
    public string Unit { get; }

    public GroceryItem(Guid id, string name, string? description, decimal unitPrice, string category, string unit)
    {
        Id = id;
        Name = name;
        Description = description;
        UnitPrice = unitPrice;
        Category = category;
        Unit = unit;
    }
}
