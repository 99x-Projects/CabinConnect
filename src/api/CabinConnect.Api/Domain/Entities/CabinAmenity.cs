namespace CabinConnect.Api.Domain.Entities;

public sealed class CabinAmenity
{
    public Guid CabinId { get; private set; }
    public Guid AmenityId { get; private set; }
    public Amenity Amenity { get; private set; } = null!;
}
