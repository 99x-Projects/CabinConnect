using System.Security.Claims;
using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace CabinConnect.Tests;

public class CabinDetailControllerTests
{
    private readonly ICabinRepository _repo = Substitute.For<ICabinRepository>();
    private readonly ICabinService _cabinService = Substitute.For<ICabinService>();
    private readonly ICabinKeyInfoService _keyInfoService = Substitute.For<ICabinKeyInfoService>();
    private readonly CabinsController _sut;

    private static readonly Guid HostId = Guid.NewGuid();
    private static readonly Guid CabinId = Guid.NewGuid();

    private readonly Cabin _ownedCabin = new()
    {
        Id = CabinId,
        HostId = HostId,
        Name = "Pine Lodge",
        Location = "Forest",
        Capacity = 4,
        Description = "Cozy",
        BaseRate = 0,
        IsActive = true,
        Version = 1,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow
    };

    private static readonly KeyInfoDto MaskedKeyInfo =
        new(CabinId, "****2024", "****0100", "No smoking.");

    public CabinDetailControllerTests()
    {
        _sut = new CabinsController(_repo, _cabinService, _keyInfoService);
        SetAuthenticatedHost(HostId);
        _repo.GetByIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns(_ownedCabin);
        _keyInfoService.GetAsync(HostId, CabinId, false, Arg.Any<CancellationToken>()).Returns(MaskedKeyInfo);
    }

    private void SetAuthenticatedHost(Guid hostId)
    {
        var claims = new[] { new Claim("sub", hostId.ToString()) };
        var identity = new ClaimsIdentity(claims, "Test");
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

    private void SetUnauthenticated()
    {
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
        };
    }

    // AC1: returns full detail with public fields, amenity tags, masked key info, and version
    [Fact]
    public async Task GetById_OwnedCabin_Returns200WithFullDetail()
    {
        var result = await _sut.GetById(CabinId, reveal: false, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (CabinDetailDto)result.Value!;
        dto.Id.Should().Be(CabinId);
        dto.Name.Should().Be("Pine Lodge");
        dto.Version.Should().Be(1);
        dto.KeyInfo.Should().BeEquivalentTo(MaskedKeyInfo);
        dto.AmenityTags.Should().NotBeNull();
    }

    // AC2: reveal=true → key info service called with reveal=true; plaintext fields returned
    [Fact]
    public async Task GetById_RevealTrue_CallsKeyInfoServiceWithRevealAndReturnsPlaintext()
    {
        var plaintextKeyInfo = new KeyInfoDto(CabinId, "PINE2024", "+1-555-0100", "No smoking.");
        _keyInfoService.GetAsync(HostId, CabinId, true, Arg.Any<CancellationToken>()).Returns(plaintextKeyInfo);

        var result = await _sut.GetById(CabinId, reveal: true, default) as OkObjectResult;

        await _keyInfoService.Received(1).GetAsync(HostId, CabinId, true, Arg.Any<CancellationToken>());
        var dto = (CabinDetailDto)result!.Value!;
        dto.KeyInfo.AccessCodes.Should().Be("PINE2024");
        dto.KeyInfo.EmergencyContacts.Should().Be("+1-555-0100");
    }

    // AC3: no amenity tags → amenity_tags is empty array
    [Fact]
    public async Task GetById_NoAmenityTags_ReturnsEmptyTagsArray()
    {
        _ownedCabin.AmenityTags.Clear();

        var result = await _sut.GetById(CabinId, reveal: false, default) as OkObjectResult;

        var dto = (CabinDetailDto)result!.Value!;
        dto.AmenityTags.Should().BeEmpty();
    }

    // AC4: key info never set → null fields in key_info, not 404
    [Fact]
    public async Task GetById_KeyInfoNeverSet_Returns200WithNullKeyInfoFields()
    {
        var emptyKeyInfo = new KeyInfoDto(CabinId, null, null, null);
        _keyInfoService.GetAsync(HostId, CabinId, false, Arg.Any<CancellationToken>()).Returns(emptyKeyInfo);

        var result = await _sut.GetById(CabinId, reveal: false, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (CabinDetailDto)result.Value!;
        dto.KeyInfo.AccessCodes.Should().BeNull();
        dto.KeyInfo.EmergencyContacts.Should().BeNull();
        dto.KeyInfo.HouseRules.Should().BeNull();
    }

    // AC5: cabin not owned by requesting host → 403
    [Fact]
    public async Task GetById_NotOwner_Returns403()
    {
        var otherHostCabin = new Cabin
        {
            Id = CabinId,
            HostId = Guid.NewGuid(),
            Name = "Other Lodge",
            Location = "Hills",
            Capacity = 2,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _repo.GetByIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns(otherHostCabin);

        var result = await _sut.GetById(CabinId, reveal: false, default) as StatusCodeResult;

        result!.StatusCode.Should().Be(403);
    }

    // AC6: cabin does not exist → 404
    [Fact]
    public async Task GetById_CabinNotFound_Returns404()
    {
        _repo.GetByIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns((Cabin?)null);

        var result = await _sut.GetById(CabinId, reveal: false, default);

        result.Should().BeOfType<NotFoundResult>();
    }

    // AC7: unauthenticated → 401
    [Fact]
    public async Task GetById_Unauthenticated_Returns401()
    {
        SetUnauthenticated();

        var result = await _sut.GetById(CabinId, reveal: false, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }
}
