using System.Security.Claims;
using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Exceptions;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace CabinConnect.Tests;

public class InvitationsControllerTests
{
    private readonly IInvitationService _service = Substitute.For<IInvitationService>();
    private readonly InvitationsController _sut;

    public InvitationsControllerTests()
    {
        _sut = new InvitationsController(_service);
        SetSuperAdmin();
    }

    private void SetSuperAdmin()
    {
        var claims = new[] { new Claim("sub", Guid.NewGuid().ToString()), new Claim("app_role", "super_admin") };
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test")) }
        };
    }

    private void SetRegularUser()
    {
        var claims = new[] { new Claim("sub", Guid.NewGuid().ToString()) };
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test")) }
        };
    }

    private void SetUnauthenticated()
    {
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
        };
    }

    // AC-1: super admin posts valid email+role → 200
    [Fact]
    public async Task Create_WithValidRequest_ReturnsOk()
    {
        var request = new CreateInvitationRequest("new@example.com", "cabin_owner");

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<OkObjectResult>();
        await _service.Received(1).InviteAsync("new@example.com", "cabin_owner", default);
    }

    // AC-2: super admin posts already-registered email → 409
    [Fact]
    public async Task Create_WithAlreadyRegisteredEmail_Returns409()
    {
        var request = new CreateInvitationRequest("existing@example.com", "guest");
        _service.InviteAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserAlreadyExistsException("existing@example.com"));

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<ConflictObjectResult>();
    }

    // AC-3: super admin posts email with pending invitation → 409
    [Fact]
    public async Task Create_WithPendingInvitation_Returns409()
    {
        var request = new CreateInvitationRequest("pending@example.com", "guest");
        _service.InviteAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new PendingInvitationExistsException("pending@example.com"));

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<ConflictObjectResult>();
    }

    // AC-4: non-super-admin → 403
    [Fact]
    public async Task Create_WithNonSuperAdmin_Returns403()
    {
        SetRegularUser();
        var request = new CreateInvitationRequest("user@example.com", "guest");

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<StatusCodeResult>().Which.StatusCode.Should().Be(403);
        await _service.DidNotReceive().InviteAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    // AC-5: unauthenticated → 401
    [Fact]
    public async Task Create_Unauthenticated_Returns401()
    {
        SetUnauthenticated();
        var request = new CreateInvitationRequest("user@example.com", "guest");

        var result = await _sut.Create(request, default);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    // AC-6: super admin resends pending invitation → 200, email resent
    [Fact]
    public async Task Resend_WithPendingInvitation_ReturnsOk()
    {
        var result = await _sut.Resend("pending@example.com", default);

        result.Should().BeOfType<OkObjectResult>();
        await _service.Received(1).ResendAsync("pending@example.com", default);
    }

    // AC-6: resend for non-existent invitation → 404
    [Fact]
    public async Task Resend_WithNoInvitation_Returns404()
    {
        _service.ResendAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvitationNotFoundException("nobody@example.com"));

        var result = await _sut.Resend("nobody@example.com", default);

        result.Should().BeOfType<NotFoundResult>();
    }

    // AC-7: super admin cancels pending invitation → 204, record removed
    [Fact]
    public async Task Cancel_WithPendingInvitation_Returns204()
    {
        var result = await _sut.Cancel("pending@example.com", default);

        result.Should().BeOfType<NoContentResult>();
        await _service.Received(1).CancelAsync("pending@example.com", default);
    }

    // AC-7: cancel for non-existent invitation → 404
    [Fact]
    public async Task Cancel_WithNoInvitation_Returns404()
    {
        _service.CancelAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvitationNotFoundException("nobody@example.com"));

        var result = await _sut.Cancel("nobody@example.com", default);

        result.Should().BeOfType<NotFoundResult>();
    }
}
