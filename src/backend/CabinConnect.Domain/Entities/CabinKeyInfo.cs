namespace CabinConnect.Domain.Entities;

public class CabinKeyInfo
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public string? AccessCodes { get; set; }
    public string? EmergencyContacts { get; set; }
    public string? HouseRules { get; set; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; set; }
}
