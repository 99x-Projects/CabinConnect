using CabinConnect.Api.Application.Amenities;
using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Tests.Infrastructure;

internal sealed class FakeAmenityRepository(IEnumerable<Amenity> amenities) : IAmenityRepository
{
    private readonly HashSet<Guid> _amenityIds = amenities.Select(amenity => amenity.Id).ToHashSet();

    public Task<IReadOnlyList<Amenity>> GetAllAsync(CancellationToken cancellationToken)
    {
        IReadOnlyList<Amenity> data = amenities.ToArray();
        return Task.FromResult(data);
    }

    public Task<bool> AllExistAsync(IReadOnlyList<Guid> amenityIds, CancellationToken cancellationToken)
    {
        var allExist = amenityIds.All(id => _amenityIds.Contains(id));
        return Task.FromResult(allExist);
    }
}
