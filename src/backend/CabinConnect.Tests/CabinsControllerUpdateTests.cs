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

public class CabinsControllerUpdateTests
{
    private readonly ICabinRepository _repo = Substitute.For<ICabinRepository>();
    private readonly ICabinService _service = Substitute.For<ICabinService>();
    private readonly ICabinKeyInfoService _keyInfoService = Substitute.For<ICabinKeyInfoService>();
    private readonly CabinsController _sut;

    private static readonly Guid HostId = Guid.NewGuid();
    private static readonly Guid CabinId = Guid.NewGuid();

    public CabinsControllerUpdateTests()
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

    private static CabinDto MakeCabinDto() => new(
        CabinId, "Pine Lodge", "Forest", 4, "Updated", HostId,
        0, true, 2, [], DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static UpdateCabinRequest ValidRequest(int version = 1) =>
        new("Pine Lodge", "Forest", 4, "Updated", [], version);

    // AC1: valid update → 200 with updated CabinDto
    [Fact]
    public async Task Update_ValidRequest_Returns200WithDto()
    {
        var request = ValidRequest();
        var dto = MakeCabinDto();
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>()).Returns(dto);

        var result = await _sut.Update(CabinId, request, default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        result.Value.Should().BeEquivalentTo(dto);
    }

    // AC2: duplicate cabin name → 409
    [Fact]
    public async Task Update_DuplicateName_Returns409()
    {
        var request = ValidRequest();
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new DuplicateCabinNameException("Pine Lodge"));

        var result = await _sut.Update(CabinId, request, default) as ConflictObjectResult;

        result!.StatusCode.Should().Be(409);
    }

    // AC3: name > 512 chars → 400
    [Fact]
    public async Task Update_NameExceeds512Chars_Returns400()
    {
        _sut.ModelState.AddModelError("Name", "Name must not exceed 512 characters.");
        var request = new UpdateCabinRequest(new string('A', 513), "Forest", 4, null, [], 1);

        var result = await _sut.Update(CabinId, request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC4: capacity ≤ 0 → 400
    [Fact]
    public async Task Update_ZeroCapacity_Returns400()
    {
        _sut.ModelState.AddModelError("Capacity", "Capacity must be at least 1.");
        var request = new UpdateCabinRequest("Pine Lodge", "Forest", 0, null, [], 1);

        var result = await _sut.Update(CabinId, request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC5: invalid amenity tag IDs → 400 with invalid IDs
    [Fact]
    public async Task Update_InvalidAmenityTagIds_Returns400WithInvalidIds()
    {
        var badId = Guid.NewGuid();
        var request = new UpdateCabinRequest("Pine Lodge", "Forest", 4, null, [badId], 1);
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new InvalidAmenityTagsException([badId]));

        var result = await _sut.Update(CabinId, request, default) as BadRequestObjectResult;

        result!.StatusCode.Should().Be(400);
        result.Value.Should().BeEquivalentTo(new { error = new InvalidAmenityTagsException([badId]).Message, invalidIds = new[] { badId } });
    }

    // AC6: cabin not owned by this host → 403
    [Fact]
    public async Task Update_NotOwner_Returns403()
    {
        var request = ValidRequest();
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new CabinOwnershipException(CabinId));

        var result = await _sut.Update(CabinId, request, default) as StatusCodeResult;

        result!.StatusCode.Should().Be(403);
    }

    // AC7: cabin not found → 404
    [Fact]
    public async Task Update_CabinNotFound_Returns404()
    {
        var request = ValidRequest();
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new CabinNotFoundException(CabinId));

        var result = await _sut.Update(CabinId, request, default);

        result.Should().BeOfType<NotFoundResult>();
    }

    // AC8: unauthenticated → 401
    [Fact]
    public async Task Update_Unauthenticated_Returns401()
    {
        SetUnauthenticated();
        var request = ValidRequest();

        var result = await _sut.Update(CabinId, request, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    // AC9: stale version → 409 with currentVersion
    [Fact]
    public async Task Update_StaleVersion_Returns409WithCurrentVersion()
    {
        var request = ValidRequest(version: 1);
        _service.UpdateAsync(HostId, CabinId, request, Arg.Any<CancellationToken>())
            .Throws(new CabinVersionConflictException(CabinId, currentVersion: 3));

        var result = await _sut.Update(CabinId, request, default) as ConflictObjectResult;

        result!.StatusCode.Should().Be(409);
        result.Value.Should().BeEquivalentTo(new
        {
            error = new CabinVersionConflictException(CabinId, 3).Message,
            currentVersion = 3
        });
    }
}
