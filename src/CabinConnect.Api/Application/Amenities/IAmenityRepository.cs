using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Application.Amenities;

public interface IAmenityRepository
{
    Task<IReadOnlyList<Amenity>> GetAllAsync(CancellationToken cancellationToken);

    Task<bool> AllExistAsync(IReadOnlyList<Guid> amenityIds, CancellationToken cancellationToken);
}
