using CabinConnect.Domain.Groceries;
using CabinConnect.Infrastructure.Data;
using Dapper;

namespace CabinConnect.Infrastructure.Repositories;

public sealed class GroceryItemRepository : IGroceryItemRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GroceryItemRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<GroceryItem>> GetAvailableAsync(string? category, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.Create();

        const string sql = """
            SELECT id, name, description, unit_price, category, unit
            FROM grocery_items
            WHERE available = true
              AND (@Category IS NULL OR category = @Category)
            ORDER BY category, name
            """;

        var rows = await connection.QueryAsync<GroceryItemRow>(
            new CommandDefinition(sql, new { Category = category }, cancellationToken: cancellationToken));

        return rows.Select(r => new GroceryItem(r.Id, r.Name, r.Description, r.UnitPrice, r.Category, r.Unit)).ToList();
    }

    private sealed record GroceryItemRow(Guid Id, string Name, string? Description, decimal UnitPrice, string Category, string Unit);
}
