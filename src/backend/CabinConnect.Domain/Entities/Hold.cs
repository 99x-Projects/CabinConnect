namespace CabinConnect.Domain.Entities;

public class Hold
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public string GuestId { get; init; } = string.Empty;
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public DateTimeOffset ExpiresAt { get; init; }

    public bool IsExpired(DateTimeOffset now) => now >= ExpiresAt;
}
