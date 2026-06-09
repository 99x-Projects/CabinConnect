namespace CabinConnect.Api.Domain;

public class Cabin
{
    public Guid Id { get; set; }
    public Guid HostId { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string Location { get; set; } = default!;
    public decimal BaseRate { get; set; }
    public int MaxGuests { get; set; }
    public DateTime CreatedAt { get; set; }
}
