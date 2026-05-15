namespace CabinConnect.Domain.Entities;

public class KeyInfoRevealLog
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public Guid HostId { get; init; }
    public DateTimeOffset RevealedAt { get; init; }
}
