namespace CabinConnect.Domain.Users;

/// <summary>
/// App-side mirror of a Supabase Auth identity. <see cref="Id"/> is the Supabase
/// user id (`auth.users.id`) — never a value the client supplies. The row is
/// provisioned lazily on the first authenticated API call (idempotent upsert
/// keyed on <see cref="Id"/>; see EC-A in the <c>owner-signup</c> unit).
/// </summary>
public sealed class User
{
    public Guid Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Owner;

    public DateTime CreatedAt { get; set; }
}
