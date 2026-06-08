namespace CabinConnect.Api.Domain.Entities;

public sealed class CabinAmenity
{
    private CabinAmenity() { }

    public Guid CabinId { get; private set; }
    public Guid AmenityId { get; private set; }
    public Amenity Amenity { get; private set; } = null!;

    public static CabinAmenity Create(Guid cabinId, Guid amenityId) =>
        new() { CabinId = cabinId, AmenityId = amenityId };
}
