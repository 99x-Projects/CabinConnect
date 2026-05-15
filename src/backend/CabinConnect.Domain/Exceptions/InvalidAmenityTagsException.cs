namespace CabinConnect.Domain.Exceptions;

public class InvalidAmenityTagsException(IReadOnlyList<Guid> invalidIds)
    : Exception($"The following amenity tag IDs are not in the predefined list: {string.Join(", ", invalidIds)}")
{
    public IReadOnlyList<Guid> InvalidIds { get; } = invalidIds;
}
