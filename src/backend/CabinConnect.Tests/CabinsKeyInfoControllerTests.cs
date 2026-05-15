using System.Security.Claims;
using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace CabinConnect.Tests;

public class CabinsKeyInfoControllerTests
{
    private readonly ICabinRepository _repo = Substitute.For<ICabinRepository>();
    private readonly ICabinService _cabinService = Substitute.For<ICabinService>();
    private readonly ICabinKeyInfoService _keyInfoService = Substitute.For<ICabinKeyInfoService>();
    private readonly CabinsController _sut;

    private static readonly Guid HostId = Guid.NewGuid();
    private static readonly Guid CabinId = Guid.NewGuid();

    public CabinsKeyInfoControllerTests()
    {
        _sut = new CabinsController(_repo, _cabinService, _keyInfoService);
        SetAuthenticatedHost(HostId);
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

    // AC1: upsert saves data, response masks access codes + emergency contacts, house rules in plaintext
    [Fact]
    public async Task UpsertKeyInfo_ValidRequest_Returns200WithMaskedSensitiveFields()
    {
        var request = new UpsertKeyInfoRequest("PINE2024", "+1-555-0100", "No smoking.");
        var maskedDto = new KeyInfoDto(CabinId, "****2024", "****0100", "No smoking.");
        _keyInfoService.UpsertAsync(HostId, CabinId, request, Arg.Any<CancellationToken>()).Returns(maskedDto);

        var result = await _sut.UpsertKeyInfo(CabinId, request, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (KeyInfoDto)result.Value!;
        dto.AccessCodes.Should().Be("****2024");
        dto.EmergencyContacts.Should().Be("****0100");
        dto.HouseRules.Should().Be("No smoking.");
    }

    // AC2: GET without reveal → masked access codes + emergency contacts, plaintext house rules
    [Fact]
    public async Task GetKeyInfo_WithoutReveal_ReturnsMaskedFields()
    {
        var maskedDto = new KeyInfoDto(CabinId, "****2024", "****0100", "No smoking.");
        _keyInfoService.GetAsync(HostId, CabinId, false, Arg.Any<CancellationToken>()).Returns(maskedDto);

        var result = await _sut.GetKeyInfo(CabinId, reveal: false, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (KeyInfoDto)result.Value!;
        dto.AccessCodes.Should().StartWith("****");
        dto.EmergencyContacts.Should().StartWith("****");
        dto.HouseRules.Should().Be("No smoking.");
    }

    // AC3: GET with reveal=true → all fields plaintext
    [Fact]
    public async Task GetKeyInfo_WithReveal_ReturnsPlaintextFields()
    {
        var plaintextDto = new KeyInfoDto(CabinId, "PINE2024", "+1-555-0100", "No smoking.");
        _keyInfoService.GetAsync(HostId, CabinId, true, Arg.Any<CancellationToken>()).Returns(plaintextDto);

        var result = await _sut.GetKeyInfo(CabinId, reveal: true, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (KeyInfoDto)result.Value!;
        dto.AccessCodes.Should().Be("PINE2024");
        dto.EmergencyContacts.Should().Be("+1-555-0100");
    }

    // AC4: GET when key info never set → 200 with null fields
    [Fact]
    public async Task GetKeyInfo_NeverSet_Returns200WithNullFields()
    {
        var emptyDto = new KeyInfoDto(CabinId, null, null, null);
        _keyInfoService.GetAsync(HostId, CabinId, false, Arg.Any<CancellationToken>()).Returns(emptyDto);

        var result = await _sut.GetKeyInfo(CabinId, reveal: false, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dto = (KeyInfoDto)result.Value!;
        dto.AccessCodes.Should().BeNull();
        dto.EmergencyContacts.Should().BeNull();
        dto.HouseRules.Should().BeNull();
    }

    // AC6: cabin not owned by this host → 403 (GET and PUT)
    [Fact]
    public async Task GetKeyInfo_NotOwner_Returns403()
    {
        _keyInfoService.GetAsync(HostId, CabinId, false, Arg.Any<CancellationToken>())
            .Throws(new CabinOwnershipException(CabinId));

        var result = await _sut.GetKeyInfo(CabinId, reveal: false, default) as StatusCodeResult;

        result!.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task UpsertKeyInfo_NotOwner_Returns403()
    {
        var request = new UpsertKeyInfoRequest("1234", null, null);
        _keyInfoService.UpsertAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new CabinOwnershipException(CabinId));

        var result = await _sut.UpsertKeyInfo(CabinId, request, default) as StatusCodeResult;

        result!.StatusCode.Should().Be(403);
    }

    // AC7: unauthenticated → 401 (GET and PUT)
    [Fact]
    public async Task GetKeyInfo_Unauthenticated_Returns401()
    {
        SetUnauthenticated();

        var result = await _sut.GetKeyInfo(CabinId, reveal: false, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task UpsertKeyInfo_Unauthenticated_Returns401()
    {
        SetUnauthenticated();
        var request = new UpsertKeyInfoRequest(null, null, null);

        var result = await _sut.UpsertKeyInfo(CabinId, request, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }
}
