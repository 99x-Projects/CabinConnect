using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface IHoldRepository
{
    Task<Hold?> GetActiveByIdAsync(Guid id, DateTimeOffset now, CancellationToken ct = default);
    Task<bool> HasActiveOverlapAsync(Guid cabinId, DateOnly checkIn, DateOnly checkOut, DateTimeOffset now, CancellationToken ct = default);
    Task<Hold> AddAsync(Hold hold, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
