namespace CabinConnect.Domain.Entities;

public class SeasonalRate
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal NightlyRate { get; init; }
}
