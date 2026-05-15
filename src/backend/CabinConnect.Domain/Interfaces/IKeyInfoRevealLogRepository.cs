using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface IKeyInfoRevealLogRepository
{
    Task LogAsync(KeyInfoRevealLog entry, CancellationToken ct = default);
}
