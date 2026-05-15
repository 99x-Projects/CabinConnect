using CabinConnect.Domain.Enums;

namespace CabinConnect.Domain.Entities;

public class Booking
{
    public Guid Id { get; init; }
    public Guid CabinId { get; init; }
    public string GuestId { get; init; } = string.Empty;
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public BookingStatus Status { get; set; }
    public decimal TotalPrice { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; set; }

    public int Nights => CheckOut.DayNumber - CheckIn.DayNumber;
}
