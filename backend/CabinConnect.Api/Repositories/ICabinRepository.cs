using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Repositories;

public interface ICabinRepository
{
    Task<Cabin> CreateAsync(Cabin cabin, CancellationToken cancellationToken = default);
}
