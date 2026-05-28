namespace CabinConnect.Domain.Cabins;

/// <summary>
/// The anchor record for everything an owner publishes about their property.
/// <see cref="OwnerId"/> is always the verified Supabase user id from the JWT
/// (EC-007); the request body is never trusted to supply it. MVP enforces
/// exactly one cabin per owner via <c>UNIQUE(owner_id)</c>. Sensitive
/// operational details (access codes, emergency contacts, house rules) live on
/// a separate record managed by the <c>cabin-operational</c> unit and never
/// appear on this entity or its public DTO.
/// </summary>
public sealed class Cabin
{
    public Guid Id { get; set; }

    public Guid OwnerId { get; set; }

    public Guid CommunityId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public List<string> Amenities { get; set; } = new();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
