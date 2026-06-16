using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;

namespace CabinConnect.Api.Tests.Infrastructure;

internal sealed class FakeCabinRepository(
    IReadOnlyDictionary<Guid, Amenity> catalogLookup,
    IEnumerable<Cabin>? seed = null) : ICabinRepository
{
    private readonly List<Cabin> _cabins = seed?.ToList() ?? [];

    public Task<bool> DeactivateAsync(Guid cabinId, Guid hostId, CancellationToken cancellationToken)
    {
        var index = _cabins.FindIndex(c => c.Id == cabinId && c.HostId == hostId);
        if (index == -1)
        {
            return Task.FromResult(false);
        }

        _cabins[index] = _cabins[index] with { IsActive = false };
        return Task.FromResult(true);
    }

    public Task<Cabin?> UpdateAsync(
        Guid cabinId,
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken)
    {
        var index = _cabins.FindIndex(c => c.Id == cabinId && c.HostId == hostId);
        if (index == -1)
        {
            return Task.FromResult<Cabin?>(null);
        }

        var catalogAmenities = catalogAmenityIds
            .Where(id => catalogLookup.ContainsKey(id))
            .Select(id => catalogLookup[id])
            .ToArray();

        var updated = _cabins[index] with
        {
            Name = name,
            Description = description,
            StreetAddress = streetAddress,
            Capacity = capacity,
            CatalogAmenities = catalogAmenities,
            CustomAmenities = customAmenities.ToArray()
        };

        _cabins[index] = updated;
        return Task.FromResult<Cabin?>(updated);
    }

    public Task<IReadOnlyList<Cabin>> GetAllForHostAsync(Guid hostId, CancellationToken cancellationToken)
    {
        IReadOnlyList<Cabin> results = _cabins
            .Where(c => c.HostId == hostId)
            .OrderBy(c => c.Name)
            .ToArray();
        return Task.FromResult(results);
    }

    public Task<Cabin?> GetByIdForHostAsync(Guid cabinId, Guid hostId, CancellationToken cancellationToken)
    {
        var cabin = _cabins.FirstOrDefault(entry => entry.Id == cabinId && entry.HostId == hostId);
        return Task.FromResult(cabin);
    }

    public Task<Cabin> CreateAsync(
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken)
    {
        var catalogAmenities = catalogAmenityIds
            .Select(id => catalogLookup[id])
            .ToArray();

        var cabin = new Cabin(
            Guid.NewGuid(),
            hostId,
            name,
            description,
            streetAddress,
            capacity,
            true,
            catalogAmenities,
            customAmenities.ToArray());

        _cabins.Add(cabin);
        return Task.FromResult(cabin);
    }
}
