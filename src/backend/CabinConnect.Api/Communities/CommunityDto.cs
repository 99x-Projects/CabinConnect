namespace CabinConnect.Api.Communities;

/// <summary>
/// Public DTO returned by <c>GET /api/communities</c>. Includes <c>Active</c>
/// so clients can hide inactive entries from new-cabin selectors while still
/// resolving them for existing references (EC-A on <c>community-registry</c>).
/// </summary>
public sealed record CommunityDto(Guid Id, string Name, string? Region, bool Active);
