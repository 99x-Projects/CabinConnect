namespace CabinConnect.Api.Domain.Entities;

public sealed class Cabin
{
    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Street { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string Country { get; private set; } = "NO";
    public Guid CommunityId { get; private set; }
    public int Capacity { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public Guid CreatedBy { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Guid UpdatedBy { get; private set; }

    public Community Community { get; private set; } = null!;
    public IReadOnlyCollection<CabinAmenity> CabinAmenities { get; private set; } = [];
}
