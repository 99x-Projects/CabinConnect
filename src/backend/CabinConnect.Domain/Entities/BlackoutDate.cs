namespace CabinConnect.Domain.Entities;

public class BlackoutDate
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string Reason { get; set; } = string.Empty;
}
