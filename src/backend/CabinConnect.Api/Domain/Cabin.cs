using CabinConnect.Api.Domain.Enums;

namespace CabinConnect.Api.Domain;

public class Cabin
{
    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Location { get; private set; } = string.Empty;
    public int Capacity { get; private set; }
    public List<Amenity> Amenities { get; private set; } = new();
    public CabinStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private Cabin() { }

    public static Cabin Create(Guid ownerId, string name, string location, int capacity, List<Amenity> amenities)
    {
        return new Cabin
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = name,
            Location = location,
            Capacity = capacity,
            Amenities = amenities,
            Status = CabinStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Update(string? name, string? location, int? capacity, List<Amenity>? amenities)
    {
        if (name is not null) Name = name;
        if (location is not null) Location = location;
        if (capacity is not null) Capacity = capacity.Value;
        if (amenities is not null) Amenities = amenities;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Deactivate()
    {
        Status = CabinStatus.Inactive;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Reactivate()
    {
        Status = CabinStatus.Active;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
