using CabinConnect.Api.Domain.Entities;
using CabinConnect.Api.Dtos.Requests;
using CabinConnect.Api.Infrastructure.Persistence;
using CabinConnect.Api.Repositories;
using CabinConnect.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Tests.Units;

/// <summary>
/// Unit tests for cabin-create (AC-1 through AC-8).
/// Uses EF Core InMemory — no real DB needed for service-layer tests.
/// Integration tests against real Supabase are in CabinCreateIntegrationTests.
/// </summary>
public sealed class CabinCreateServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CabinService _service;
    private readonly Guid _communityId = new("a1000000-0000-0000-0000-000000000001");
    private readonly Guid _amenityWifiId = new("b2000000-0000-0000-0000-000000000001");
    private readonly Guid _amenitySaunaId = new("b2000000-0000-0000-0000-000000000007");

    public CabinCreateServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);

        // Seed reference data
        SeedReferenceData();

        var repo = new CabinRepository(_db);
        _service = new CabinService(repo, _db);
    }

    private void SeedReferenceData()
    {
        // Use reflection to seed private-setter entities via EF's change tracker
        var community = (Community)Activator.CreateInstance(typeof(Community), nonPublic: true)!;
        typeof(Community).GetProperty("Id")!.SetValue(community, _communityId);
        typeof(Community).GetProperty("Name")!.SetValue(community, "Trysil");
        typeof(Community).GetProperty("Region")!.SetValue(community, "Innlandet");
        _db.Communities.Add(community);

        foreach (var (id, name) in new[]
        {
            (_amenityWifiId, "Wi-Fi"),
            (_amenitySaunaId, "Sauna"),
        })
        {
            var amenity = (Amenity)Activator.CreateInstance(typeof(Amenity), nonPublic: true)!;
            typeof(Amenity).GetProperty("Id")!.SetValue(amenity, id);
            typeof(Amenity).GetProperty("Name")!.SetValue(amenity, name);
            _db.Amenities.Add(amenity);
        }

        _db.SaveChanges();
    }

    private CreateCabinRequest ValidRequest(Guid[]? amenityIds = null, string name = "Mountain Hideaway", Guid? communityId = null) => new()
    {
        Name = name,
        Address = new AddressRequest
        {
            Street = "Skiveien 1",
            PostalCode = "2420",
            City = "Trysil",
            Country = "NO",
        },
        CommunityId = communityId ?? _communityId,
        Capacity = 6,
        AmenityIds = amenityIds ?? [],
    };

    // AC-1: Happy path — cabin is created
    [Fact]
    public async Task Create_ValidRequest_Returns201WithFullProfile()
    {
        var ownerId = Guid.NewGuid();
        var (cabin, error, status) = await _service.CreateAsync(ownerId, ValidRequest([_amenityWifiId]));

        Assert.Equal(201, status);
        Assert.Null(error);
        Assert.NotEqual(Guid.Empty, cabin.Id);
        Assert.Equal("Mountain Hideaway", cabin.Name);
        Assert.Equal(_communityId, cabin.Community.Id);
        Assert.Equal("Trysil", cabin.Community.Name);
        Assert.Single(cabin.Amenities);
        Assert.Equal("Wi-Fi", cabin.Amenities[0].Name);
        Assert.True(cabin.CreatedAt > DateTimeOffset.MinValue);
        Assert.True(cabin.UpdatedAt > DateTimeOffset.MinValue);
    }

    // AC-1: owner_id is never in the response (internal field)
    [Fact]
    public async Task Create_ValidRequest_OwnerIdNotInResponse()
    {
        var ownerId = Guid.NewGuid();
        var (cabin, _, _) = await _service.CreateAsync(ownerId, ValidRequest());

        // CabinResponse has no OwnerId property — verified at compile time by type shape
        var responseType = cabin.GetType();
        Assert.Null(responseType.GetProperty("OwnerId"));
    }

    // AC-3: Name trimmed — empty-after-trim name is caught by DataAnnotations before service
    [Fact]
    public async Task Create_NameTrimmedOnPersist()
    {
        var ownerId = Guid.NewGuid();
        var request = ValidRequest(name: "  Lake House  ");
        var (cabin, _, status) = await _service.CreateAsync(ownerId, request);

        Assert.Equal(201, status);
        Assert.Equal("Lake House", cabin.Name);
    }

    // AC-4: Community not in seeded list → 400
    [Fact]
    public async Task Create_UnknownCommunityId_Returns400()
    {
        var ownerId = Guid.NewGuid();
        var request = ValidRequest(communityId: Guid.NewGuid());
        var (_, error, status) = await _service.CreateAsync(ownerId, request);

        Assert.Equal(400, status);
        Assert.Contains("community", error, StringComparison.OrdinalIgnoreCase);
    }

    // AC-5: Amenity not in controlled list → 400
    [Fact]
    public async Task Create_InvalidAmenityId_Returns400WithOffendingId()
    {
        var ownerId = Guid.NewGuid();
        var badAmenityId = Guid.NewGuid();
        var request = ValidRequest([_amenityWifiId, badAmenityId]);
        var (_, error, status) = await _service.CreateAsync(ownerId, request);

        Assert.Equal(400, status);
        Assert.Contains(badAmenityId.ToString(), error);
    }

    // AC-6: Owner at cap of 10 → 409
    [Fact]
    public async Task Create_OwnerAt10ActiveCabins_Returns409()
    {
        var ownerId = Guid.NewGuid();

        // Create 10 cabins
        for (var i = 0; i < 10; i++)
            await _service.CreateAsync(ownerId, ValidRequest(name: $"Cabin {i}"));

        var (_, error, status) = await _service.CreateAsync(ownerId, ValidRequest(name: "Cabin 11"));

        Assert.Equal(409, status);
        Assert.Contains("limit", error, StringComparison.OrdinalIgnoreCase);
    }

    // AC-8: Soft-deleted cabins do NOT count toward the cap
    [Fact]
    public async Task Create_SoftDeletedCabinsExcludedFromCap_Succeeds()
    {
        var ownerId = Guid.NewGuid();

        // Create 10 cabins
        var created = new List<Guid>();
        for (var i = 0; i < 10; i++)
        {
            var (c, _, _) = await _service.CreateAsync(ownerId, ValidRequest(name: $"Cabin {i}"));
            created.Add(c.Id);
        }

        // Soft-delete 2 directly in DB
        var toDelete = _db.Cabins.Where(c => created.Take(2).Contains(c.Id)).ToList();
        foreach (var c in toDelete)
            typeof(Cabin).GetProperty("IsDeleted")!.SetValue(c, true);
        await _db.SaveChangesAsync();

        // Should now succeed (8 active, cap is 10)
        var (cabin, error, status) = await _service.CreateAsync(ownerId, ValidRequest(name: "Cabin after delete"));

        Assert.Equal(201, status);
        Assert.Null(error);
    }

    // AC-7: owner_id always from caller (ownerId param), never from request body
    [Fact]
    public async Task Create_OwnerIdPersistedFromCaller_NotRequestBody()
    {
        var realOwnerId = Guid.NewGuid();
        var (cabin, _, status) = await _service.CreateAsync(realOwnerId, ValidRequest());

        Assert.Equal(201, status);
        var persisted = _db.Cabins.Single(c => c.Id == cabin.Id);
        Assert.Equal(realOwnerId, persisted.OwnerId);
    }

    public void Dispose() => _db.Dispose();
}
