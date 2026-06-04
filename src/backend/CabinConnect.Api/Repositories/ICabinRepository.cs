using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Repositories;

public interface ICabinRepository
{
    Task<Cabin> CreateAsync(Cabin cabin, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cabin>> GetAllByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task<Cabin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Cabin> UpdateAsync(Cabin cabin, CancellationToken cancellationToken = default);
}
