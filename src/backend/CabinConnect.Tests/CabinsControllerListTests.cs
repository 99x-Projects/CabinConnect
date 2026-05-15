using System.Security.Claims;
using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace CabinConnect.Tests;

public class CabinsControllerListTests
{
    private readonly ICabinRepository _repo = Substitute.For<ICabinRepository>();
    private readonly ICabinService _service = Substitute.For<ICabinService>();
    private readonly ICabinKeyInfoService _keyInfoService = Substitute.For<ICabinKeyInfoService>();
    private readonly CabinsController _sut;

    private static readonly Guid HostId = Guid.NewGuid();
    private static readonly Guid OtherHostId = Guid.NewGuid();

    public CabinsControllerListTests()
    {
        _sut = new CabinsController(_repo, _service, _keyInfoService);
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

    private static CabinDto MakeDto(Guid hostId, bool isActive = true, DateTimeOffset? createdAt = null) => new(
        Guid.NewGuid(), "Cabin", "Forest", 2, null, hostId,
        0, isActive, 1, [], createdAt ?? DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    // AC1: returns only the host's own cabins with public profile fields
    [Fact]
    public async Task GetAll_WithCabins_Returns200WithHostCabins()
    {
        var dto1 = MakeDto(HostId);
        var dto2 = MakeDto(HostId);
        _service.GetByHostAsync(HostId, Arg.Any<CancellationToken>()).Returns([dto1, dto2]);

        var result = await _sut.GetAll(default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var list = (result.Value as IReadOnlyList<CabinDto>)!;
        list.Should().HaveCount(2);
        list.Should().AllSatisfy(d => d.HostId.Should().Be(HostId));
    }

    // AC2: no cabins → 200 with empty array
    [Fact]
    public async Task GetAll_NoCabins_Returns200WithEmptyArray()
    {
        _service.GetByHostAsync(HostId, Arg.Any<CancellationToken>()).Returns([]);

        var result = await _sut.GetAll(default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        (result.Value as IReadOnlyList<CabinDto>)!.Should().BeEmpty();
    }

    // AC3: service is called with the JWT-derived host ID, never another host's ID
    [Fact]
    public async Task GetAll_CallsServiceWithJwtHostId()
    {
        _service.GetByHostAsync(HostId, Arg.Any<CancellationToken>()).Returns([]);

        await _sut.GetAll(default);

        await _service.Received(1).GetByHostAsync(HostId, Arg.Any<CancellationToken>());
        await _service.DidNotReceive().GetByHostAsync(OtherHostId, Arg.Any<CancellationToken>());
    }

    // AC4: returned DTO type does not expose key information fields
    [Fact]
    public void GetAll_ReturnedDto_HasNoKeyInfoFields()
    {
        var properties = typeof(CabinDto).GetProperties().Select(p => p.Name);

        properties.Should().NotContain("AccessCode");
        properties.Should().NotContain("EmergencyContact");
        properties.Should().NotContain("HouseRules");
    }

    // AC5: unauthenticated → 401
    [Fact]
    public async Task GetAll_Unauthenticated_Returns401()
    {
        SetUnauthenticated();

        var result = await _sut.GetAll(default);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    // AC6: inactive cabins appear in the response
    [Fact]
    public async Task GetAll_IncludesInactiveCabins()
    {
        var active = MakeDto(HostId, isActive: true);
        var inactive = MakeDto(HostId, isActive: false);
        _service.GetByHostAsync(HostId, Arg.Any<CancellationToken>()).Returns([active, inactive]);

        var result = await _sut.GetAll(default) as OkObjectResult;

        var list = (result!.Value as IReadOnlyList<CabinDto>)!;
        list.Should().HaveCount(2);
        list.Should().ContainSingle(d => !d.IsActive);
    }

    // AC7: results are ordered by created_at descending (ordering delegated to service/repo)
    [Fact]
    public async Task GetAll_PreservesServiceOrdering()
    {
        var older = MakeDto(HostId, createdAt: DateTimeOffset.UtcNow.AddDays(-2));
        var newer = MakeDto(HostId, createdAt: DateTimeOffset.UtcNow);
        _service.GetByHostAsync(HostId, Arg.Any<CancellationToken>()).Returns([newer, older]);

        var result = await _sut.GetAll(default) as OkObjectResult;

        var list = (result!.Value as IReadOnlyList<CabinDto>)!;
        list[0].CreatedAt.Should().BeAfter(list[1].CreatedAt);
    }
}
