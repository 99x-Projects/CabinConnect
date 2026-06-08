namespace CabinConnect.Api.Domain.Entities;

public sealed class Amenity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
}
