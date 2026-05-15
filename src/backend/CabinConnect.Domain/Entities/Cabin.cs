namespace CabinConnect.Domain.Entities;

public class Cabin
{
    public Guid Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string HostId { get; init; } = string.Empty;
    public decimal BaseRate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; set; }
}
