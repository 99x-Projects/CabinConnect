namespace CabinConnect.Api.Cabins;

/// <summary>
/// Public profile DTO returned by cabin endpoints. Deliberately excludes all
/// sensitive operational fields (access codes, emergency contacts, house rules)
/// — those belong to a separate operational endpoint owned by the
/// <c>cabin-operational</c> unit.
/// </summary>
public sealed record CabinDto(
    Guid Id,
    Guid OwnerId,
    Guid CommunityId,
    string Name,
    string Address,
    int Capacity,
    IReadOnlyList<string> Amenities,
    DateTime CreatedAt,
    DateTime UpdatedAt);
