namespace CabinConnect.Api.Domain.Entities;

public sealed class Cabin
{
    // Private constructor for EF Core
    private Cabin() { }

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
    public List<CabinAmenity> CabinAmenities { get; private set; } = [];

    public static Cabin Create(
        Guid ownerId,
        string name,
        string street,
        string postalCode,
        string city,
        string country,
        Guid communityId,
        int capacity)
    {
        var now = DateTimeOffset.UtcNow;
        return new Cabin
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = name.Trim(),
            Street = street,
            PostalCode = postalCode,
            City = city,
            Country = country,
            CommunityId = communityId,
            Capacity = capacity,
            IsDeleted = false,
            CreatedAt = now,
            CreatedBy = ownerId,
            UpdatedAt = now,
            UpdatedBy = ownerId,
        };
    }

    public void Update(
        string name,
        string street,
        string postalCode,
        string city,
        string country,
        Guid communityId,
        int capacity,
        Guid updatedBy)
    {
        Name = name.Trim();
        Street = street;
        PostalCode = postalCode;
        City = city;
        Country = country;
        CommunityId = communityId;
        Capacity = capacity;
        UpdatedAt = DateTimeOffset.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void SoftDelete(Guid deletedBy)
    {
        IsDeleted = true;
        UpdatedAt = DateTimeOffset.UtcNow;
        UpdatedBy = deletedBy;
    }

    /// <summary>Clears all amenity links; call before re-assigning amenities on edit.</summary>
    public void ClearAmenities() => CabinAmenities.Clear();
}
