namespace CabinConnect.Api.Models;

public class Cabin
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string[] Amenities { get; set; } = [];
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
}
