namespace CabinConnect.Domain.Communities;

/// <summary>
/// Admin-curated community / resort that a cabin belongs to. Authoritatively
/// seeded from <c>supabase/seed.sql</c>; the API is read-only. <see cref="Id"/>
/// is a stable UUID that other modules (Events, Groceries, ToolShare) reference.
/// </summary>
public sealed class Community
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Region { get; set; }

    public bool Active { get; set; } = true;

    public DateTime CreatedAt { get; set; }
}
