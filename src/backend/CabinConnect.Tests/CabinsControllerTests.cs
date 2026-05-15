using System.Security.Claims;
using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace CabinConnect.Tests;

public class CabinsControllerTests
{
    private readonly ICabinRepository _repo = Substitute.For<ICabinRepository>();
    private readonly ICabinService _service = Substitute.For<ICabinService>();
    private readonly CabinsController _sut;

    private static readonly Guid HostId = Guid.NewGuid();

    public CabinsControllerTests()
    {
        _sut = new CabinsController(_repo, _service);
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

    private static CabinDto MakeCabinDto(Guid hostId) => new(
        Guid.NewGuid(), "Pine Lodge", "Forest", 4, "Cozy cabin", hostId,
        0, true, 1, [], DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    // AC1: valid request → 201 Created with CabinDto
    [Fact]
    public async Task Create_ValidRequest_Returns201WithDto()
    {
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, "Cozy cabin", []);
        var dto = MakeCabinDto(HostId);
        _service.CreateAsync(HostId, request, Arg.Any<CancellationToken>()).Returns(dto);

        var result = await _sut.Create(request, default) as CreatedAtActionResult;

        result!.StatusCode.Should().Be(201);
        result.Value.Should().BeEquivalentTo(dto);
    }

    // AC2: capacity ≤ 0 → 400
    [Fact]
    public async Task Create_ZeroCapacity_Returns400()
    {
        _sut.ModelState.AddModelError("Capacity", "Capacity must be at least 1.");
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 0, null, null);

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC3: missing required field → 400
    [Fact]
    public async Task Create_MissingRequiredField_Returns400()
    {
        _sut.ModelState.AddModelError("Name", "The Name field is required.");
        var request = new CreateCabinRequest("", "Forest", 4, null, null);

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC4: invalid amenity tag IDs → 400 with invalid IDs listed
    [Fact]
    public async Task Create_InvalidAmenityTagIds_Returns400WithInvalidIds()
    {
        var badId = Guid.NewGuid();
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, [badId]);
        _service.CreateAsync(HostId, request, Arg.Any<CancellationToken>())
            .Throws(new InvalidAmenityTagsException([badId]));

        var result = await _sut.Create(request, default) as BadRequestObjectResult;

        result!.StatusCode.Should().Be(400);
        var body = result.Value!;
        body.Should().BeEquivalentTo(new { error = new InvalidAmenityTagsException([badId]).Message, invalidIds = new[] { badId } });
    }

    // AC5: empty amenity tag list → 201 with no tags
    [Fact]
    public async Task Create_EmptyAmenityTagList_Returns201WithNoTags()
    {
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, []);
        var dto = MakeCabinDto(HostId);
        _service.CreateAsync(HostId, request, Arg.Any<CancellationToken>()).Returns(dto);

        var result = await _sut.Create(request, default) as CreatedAtActionResult;

        result!.StatusCode.Should().Be(201);
        ((CabinDto)result.Value!).AmenityTags.Should().BeEmpty();
    }

    // AC6: unauthenticated request → 401
    [Fact]
    public async Task Create_Unauthenticated_Returns401()
    {
        SetUnauthenticated();
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, null);

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    // AC7: name > 512 characters → 400
    [Fact]
    public async Task Create_NameExceeds512Chars_Returns400()
    {
        _sut.ModelState.AddModelError("Name", "Name must not exceed 512 characters.");
        var request = new CreateCabinRequest(new string('A', 513), "Forest", 4, null, null);

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC8: duplicate cabin name per host → 409 Conflict
    [Fact]
    public async Task Create_DuplicateCabinName_Returns409()
    {
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, []);
        _service.CreateAsync(HostId, request, Arg.Any<CancellationToken>())
            .Throws(new DuplicateCabinNameException("Pine Lodge"));

        var result = await _sut.Create(request, default) as ConflictObjectResult;

        result!.StatusCode.Should().Be(409);
        var body = result.Value!;
        body.Should().BeEquivalentTo(new { error = new DuplicateCabinNameException("Pine Lodge").Message });
    }
}
