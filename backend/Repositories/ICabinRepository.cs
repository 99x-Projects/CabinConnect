using CabinConnect.Api.Models;

namespace CabinConnect.Api.Repositories;

public interface ICabinRepository
{
    Task<Cabin> CreateAsync(Cabin cabin);
    Task<IEnumerable<Cabin>> GetByOwnerIdAsync(Guid ownerId);
}
