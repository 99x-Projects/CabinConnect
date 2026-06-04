using CabinConnect.Api.Domain;
using CabinConnect.Api.Domain.Enums;
using CabinConnect.Api.DTOs.Cabins;
using CabinConnect.Api.Repositories;
using CabinConnect.Api.Services;
using Xunit;
using Moq;

namespace CabinConnect.Api.Tests.Services;

public class CabinServiceTests
{
    private readonly Mock<ICabinRepository> _repositoryMock;
    private readonly CabinService _sut;

    private static readonly Guid OwnerId = Guid.NewGuid();

    public CabinServiceTests()
    {
        _repositoryMock = new Mock<ICabinRepository>();

        _repositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Cabin cabin, CancellationToken _) => cabin);

        _sut = new CabinService(_repositoryMock.Object);
    }

    // AC-1.1 — Happy path: valid request creates a cabin and returns a DTO with status Active
    [Fact]
    public async Task CreateCabinAsync_WithValidRequest_ReturnsCabinDtoWithActiveStatus()
    {
        var request = new CreateCabinRequest
        {
            Name = "Mountain Retreat",
            Location = "Hemsedal, Norway",
            Capacity = 6,
            Amenities = [Amenity.WiFi, Amenity.Sauna]
        };

        var result = await _sut.CreateCabinAsync(OwnerId, request);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(OwnerId, result.OwnerId);
        Assert.Equal("Mountain Retreat", result.Name);
        Assert.Equal("Hemsedal, Norway", result.Location);
        Assert.Equal(6, result.Capacity);
        Assert.Contains(Amenity.WiFi, result.Amenities);
        Assert.Contains(Amenity.Sauna, result.Amenities);
        Assert.Equal(CabinStatus.Active, result.Status);
    }

    // AC-1.1 — Owner ID on the returned DTO must match the ownerId argument, not anything from the request
    [Fact]
    public async Task CreateCabinAsync_OwnerId_IsSetFromArgumentNotRequest()
    {
        var expectedOwnerId = Guid.NewGuid();
        var request = new CreateCabinRequest
        {
            Name = "Test Cabin",
            Location = "Test Location",
            Capacity = 2,
            Amenities = [Amenity.Parking]
        };

        var result = await _sut.CreateCabinAsync(expectedOwnerId, request);

        Assert.Equal(expectedOwnerId, result.OwnerId);
    }

    // AC-1.1 — Repository CreateAsync is called exactly once per registration
    [Fact]
    public async Task CreateCabinAsync_WithValidRequest_CallsRepositoryOnce()
    {
        var request = new CreateCabinRequest
        {
            Name = "Test Cabin",
            Location = "Oslo",
            Capacity = 4,
            Amenities = [Amenity.Fireplace]
        };

        await _sut.CreateCabinAsync(OwnerId, request);

        _repositoryMock.Verify(r => r.CreateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // TODO: AC-1.2 (missing required fields) — add integration test: POST /api/cabins with missing field → 400.
    // TODO: AC-1.3 (capacity = 0) — add integration test: POST /api/cabins with capacity: 0 → 400.
    // TODO: AC-1.4 (no amenities) — add integration test: POST /api/cabins with amenities: [] → 400.
    // TODO: AC-1.5 (unauthenticated) — add integration test: POST /api/cabins without Authorization → 401.

    // -------------------------------------------------------------------------
    // U2 — List My Cabins
    // -------------------------------------------------------------------------

    // AC-2.1 — Happy path: returns all cabins for the owner with correct fields
    [Fact]
    public async Task GetCabinsAsync_WithMultipleCabins_ReturnsAllForOwner()
    {
        var cabin1 = Cabin.Create(OwnerId, "Cabin A", "Oslo", 4, [Amenity.WiFi]);
        var cabin2 = Cabin.Create(OwnerId, "Cabin B", "Bergen", 6, [Amenity.Sauna, Amenity.Fireplace]);

        _repositoryMock
            .Setup(r => r.GetAllByOwnerAsync(OwnerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([cabin1, cabin2]);

        var result = await _sut.GetCabinsAsync(OwnerId);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, c => c.Name == "Cabin A");
        Assert.Contains(result, c => c.Name == "Cabin B");
    }

    // AC-2.2 — Empty list: returns empty collection, not null
    [Fact]
    public async Task GetCabinsAsync_WithNoCabins_ReturnsEmptyList()
    {
        _repositoryMock
            .Setup(r => r.GetAllByOwnerAsync(OwnerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetCabinsAsync(OwnerId);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    // AC-2.3 — Isolation: repository is called with the correct ownerId (RLS + query both filter by owner)
    [Fact]
    public async Task GetCabinsAsync_PassesOwnerIdToRepository()
    {
        var expectedOwnerId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetAllByOwnerAsync(expectedOwnerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        await _sut.GetCabinsAsync(expectedOwnerId);

        _repositoryMock.Verify(
            r => r.GetAllByOwnerAsync(expectedOwnerId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    // AC-2.4 — Includes inactive: inactive cabins are not filtered out at the service layer
    [Fact]
    public async Task GetCabinsAsync_IncludesInactiveCabins()
    {
        var activeCabin = Cabin.Create(OwnerId, "Active Cabin", "Oslo", 2, [Amenity.WiFi]);
        var inactiveCabin = Cabin.Create(OwnerId, "Inactive Cabin", "Bergen", 2, [Amenity.Parking]);
        inactiveCabin.Deactivate();

        _repositoryMock
            .Setup(r => r.GetAllByOwnerAsync(OwnerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([activeCabin, inactiveCabin]);

        var result = await _sut.GetCabinsAsync(OwnerId);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, c => c.Status == CabinStatus.Active);
        Assert.Contains(result, c => c.Status == CabinStatus.Inactive);
    }

    // TODO: AC-2.5 (unauthenticated) — add integration test: GET /api/cabins without Authorization → 401.

    // -------------------------------------------------------------------------
    // U3 — View Cabin Profile
    // -------------------------------------------------------------------------

    // AC-3.1 — Happy path: returns full profile for a cabin the Host owns
    [Fact]
    public async Task GetCabinAsync_OwnedCabin_ReturnsCabinDto()
    {
        var cabin = Cabin.Create(OwnerId, "Mountain Hut", "Hemsedal", 4, [Amenity.WiFi, Amenity.Sauna]);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cabin);

        var result = await _sut.GetCabinAsync(OwnerId, cabin.Id);

        Assert.NotNull(result);
        Assert.Equal(cabin.Id, result!.Id);
        Assert.Equal("Mountain Hut", result.Name);
        Assert.Equal(OwnerId, result.OwnerId);
    }

    // AC-3.2 — Wrong owner: throws UnauthorizedAccessException when cabin belongs to another Host
    [Fact]
    public async Task GetCabinAsync_WrongOwner_ThrowsUnauthorizedAccessException()
    {
        var differentOwnerId = Guid.NewGuid();
        var cabin = Cabin.Create(differentOwnerId, "Other Cabin", "Oslo", 2, [Amenity.Parking]);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cabin);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.GetCabinAsync(OwnerId, cabin.Id));
    }

    // AC-3.3 — Not found: returns null when the cabin ID does not exist
    [Fact]
    public async Task GetCabinAsync_NonExistentId_ReturnsNull()
    {
        var nonExistentId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Cabin?)null);

        var result = await _sut.GetCabinAsync(OwnerId, nonExistentId);

        Assert.Null(result);
    }

    // TODO: AC-3.4 (unauthenticated) — add integration test: GET /api/cabins/{id} without Authorization → 401.

    // -------------------------------------------------------------------------
    // U4 — Edit Cabin Profile
    // -------------------------------------------------------------------------

    // AC-4.1 — Happy path: valid update returns updated DTO
    [Fact]
    public async Task UpdateCabinAsync_ValidRequest_ReturnsUpdatedDto()
    {
        var cabin = Cabin.Create(OwnerId, "Old Name", "Old Location", 2, [Amenity.WiFi]);
        var request = new UpdateCabinRequest { Name = "New Name", Capacity = 8 };

        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.UpdateCabinAsync(OwnerId, cabin.Id, request);

        Assert.NotNull(result);
        Assert.Equal("New Name", result!.Name);
        Assert.Equal(8, result.Capacity);
        Assert.Equal("Old Location", result.Location); // unchanged field preserved (AC-4.2)
    }

    // AC-4.2 — Partial update: unspecified fields remain unchanged
    [Fact]
    public async Task UpdateCabinAsync_PartialRequest_PreservesUnchangedFields()
    {
        var cabin = Cabin.Create(OwnerId, "Original", "Oslo", 4, [Amenity.Sauna]);
        var request = new UpdateCabinRequest { Name = "Updated" }; // only name

        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.UpdateCabinAsync(OwnerId, cabin.Id, request);

        Assert.Equal("Updated", result!.Name);
        Assert.Equal("Oslo", result.Location);
        Assert.Equal(4, result.Capacity);
        Assert.Contains(Amenity.Sauna, result.Amenities);
    }

    // AC-4.4 — No amenities: throws ArgumentException when amenities list is explicitly empty
    [Fact]
    public async Task UpdateCabinAsync_EmptyAmenitiesList_ThrowsArgumentException()
    {
        var cabin = Cabin.Create(OwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        var request = new UpdateCabinRequest { Amenities = [] };

        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _sut.UpdateCabinAsync(OwnerId, cabin.Id, request));
    }

    // AC-4.5 — Wrong owner: throws UnauthorizedAccessException before any mutation
    [Fact]
    public async Task UpdateCabinAsync_WrongOwner_ThrowsUnauthorizedAccessException()
    {
        var otherOwnerId = Guid.NewGuid();
        var cabin = Cabin.Create(otherOwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        var request = new UpdateCabinRequest { Name = "Hacked" };

        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.UpdateCabinAsync(OwnerId, cabin.Id, request));

        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // AC-4.6 — Not found: returns null when cabin ID does not exist
    [Fact]
    public async Task UpdateCabinAsync_NonExistentId_ReturnsNull()
    {
        var nonExistentId = Guid.NewGuid();
        _repositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Cabin?)null);

        var result = await _sut.UpdateCabinAsync(OwnerId, nonExistentId, new UpdateCabinRequest { Name = "X" });

        Assert.Null(result);
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // TODO: AC-4.3 (invalid capacity = 0) — validated via [Range] on DTO; add integration test.
    // TODO: AC-4.7 (unauthenticated) — add integration test: PUT /api/cabins/{id} without Authorization → 401.

    // -------------------------------------------------------------------------
    // U5 — Deactivate / Reactivate Cabin
    // -------------------------------------------------------------------------

    // AC-5.1 — Deactivate: Active cabin becomes Inactive
    [Fact]
    public async Task SetCabinStatusAsync_Deactivate_SetsStatusInactive()
    {
        var cabin = Cabin.Create(OwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.SetCabinStatusAsync(OwnerId, cabin.Id, CabinStatusAction.Deactivate);

        Assert.Equal(CabinStatus.Inactive, result!.Status);
    }

    // AC-5.2 — Reactivate: Inactive cabin becomes Active
    [Fact]
    public async Task SetCabinStatusAsync_Reactivate_SetsStatusActive()
    {
        var cabin = Cabin.Create(OwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        cabin.Deactivate();
        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.SetCabinStatusAsync(OwnerId, cabin.Id, CabinStatusAction.Reactivate);

        Assert.Equal(CabinStatus.Active, result!.Status);
    }

    // AC-5.3 — Idempotent deactivate: deactivating an already-Inactive cabin returns 200, no error
    [Fact]
    public async Task SetCabinStatusAsync_DeactivateAlreadyInactive_Succeeds()
    {
        var cabin = Cabin.Create(OwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        cabin.Deactivate();
        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.SetCabinStatusAsync(OwnerId, cabin.Id, CabinStatusAction.Deactivate);

        Assert.NotNull(result);
        Assert.Equal(CabinStatus.Inactive, result!.Status);
    }

    // AC-5.4 — Idempotent reactivate: reactivating an already-Active cabin returns 200, no error
    [Fact]
    public async Task SetCabinStatusAsync_ReactivateAlreadyActive_Succeeds()
    {
        var cabin = Cabin.Create(OwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);
        _repositoryMock.Setup(r => r.UpdateAsync(cabin, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        var result = await _sut.SetCabinStatusAsync(OwnerId, cabin.Id, CabinStatusAction.Reactivate);

        Assert.NotNull(result);
        Assert.Equal(CabinStatus.Active, result!.Status);
    }

    // AC-5.5 — Wrong owner: throws before any write
    [Fact]
    public async Task SetCabinStatusAsync_WrongOwner_ThrowsUnauthorizedAccessException()
    {
        var otherOwnerId = Guid.NewGuid();
        var cabin = Cabin.Create(otherOwnerId, "Cabin", "Oslo", 2, [Amenity.WiFi]);
        _repositoryMock.Setup(r => r.GetByIdAsync(cabin.Id, It.IsAny<CancellationToken>())).ReturnsAsync(cabin);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.SetCabinStatusAsync(OwnerId, cabin.Id, CabinStatusAction.Deactivate));

        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // AC-5.6 — Not found: returns null when cabin ID does not exist
    [Fact]
    public async Task SetCabinStatusAsync_NonExistentId_ReturnsNull()
    {
        var nonExistentId = Guid.NewGuid();
        _repositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Cabin?)null);

        var result = await _sut.SetCabinStatusAsync(OwnerId, nonExistentId, CabinStatusAction.Deactivate);

        Assert.Null(result);
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Cabin>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // TODO: AC-5.7 (unauthenticated) — add integration test: PATCH /api/cabins/{id}/status without Authorization → 401.
}
