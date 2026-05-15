namespace CabinConnect.Domain.Entities;

public class Cabin
{
    public Guid Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public Guid HostId { get; init; }
    public decimal BaseRate { get; set; }
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<AmenityTag> AmenityTags { get; set; } = [];
}
