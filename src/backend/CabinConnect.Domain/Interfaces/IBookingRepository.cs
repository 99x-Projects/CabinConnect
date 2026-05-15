using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Enums;

namespace CabinConnect.Domain.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetByGuestIdAsync(string guestId, CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetOverlappingAsync(Guid cabinId, DateOnly checkIn, DateOnly checkOut, CancellationToken ct = default);
    Task<Booking> AddAsync(Booking booking, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid id, BookingStatus status, CancellationToken ct = default);
}
