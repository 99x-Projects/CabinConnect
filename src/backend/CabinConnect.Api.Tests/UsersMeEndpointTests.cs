using System.Net;
using System.Net.Http.Json;
using CabinConnect.Api.Tests.Helpers;
using CabinConnect.Api.Users;
using CabinConnect.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CabinConnect.Api.Tests;

public sealed class UsersMeEndpointTests : IClassFixture<JwtAndDbTestFactory>
{
    private static readonly Guid User1 = Guid.Parse("11111111-1111-4111-8111-111111111111");
    private static readonly Guid User2 = Guid.Parse("22222222-2222-4222-8222-222222222222");

    private readonly JwtAndDbTestFactory _factory;

    public UsersMeEndpointTests(JwtAndDbTestFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GET_users_me_without_token_returns_401()
    {
        var client = _factory.CreateClient();

        var resp = await client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task First_authenticated_call_lazily_provisions_user_row()
    {
        await ClearUsersAsync();
        var client = _factory.CreateAuthenticatedClient(
            User1,
            email: "alice@example.com",
            displayName: "Alice O.");

        var resp = await client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(body);
        Assert.Equal(User1, body!.Id);
        Assert.Equal("Alice O.", body.DisplayName);
        Assert.Equal("alice@example.com", body.Email);
        Assert.Equal("owner", body.Role);
        Assert.True(body.CreatedAt <= DateTime.UtcNow);
        Assert.True(body.CreatedAt > DateTime.UtcNow.AddMinutes(-1));

        await _factory.WithDbContextAsync(async db =>
        {
            var stored = await db.Users.AsNoTracking().SingleAsync(u => u.Id == User1);
            Assert.Equal("alice@example.com", stored.Email);
            Assert.Equal("Alice O.", stored.DisplayName);
        });
    }

    [Fact]
    public async Task Second_call_is_idempotent_and_returns_same_row()
    {
        await ClearUsersAsync();
        var client = _factory.CreateAuthenticatedClient(
            User1,
            email: "alice@example.com",
            displayName: "Alice O.");

        var first = await client.GetAsync("/api/users/me");
        var second = await client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        var firstBody = await first.Content.ReadFromJsonAsync<UserDto>();
        var secondBody = await second.Content.ReadFromJsonAsync<UserDto>();
        Assert.Equal(firstBody!.CreatedAt, secondBody!.CreatedAt);

        await _factory.WithDbContextAsync(async db =>
        {
            var rows = await db.Users.AsNoTracking().Where(u => u.Id == User1).CountAsync();
            Assert.Equal(1, rows);
        });
    }

    [Fact]
    public async Task Identity_is_always_sourced_from_JWT_sub_not_request()
    {
        await ClearUsersAsync();
        var client = _factory.CreateAuthenticatedClient(
            User1,
            email: "alice@example.com",
            displayName: "Alice O.");

        // Add a query-string id and a forged X-User-Id header to attempt overrides.
        var resp = await client.GetAsync($"/api/users/me?id={User2}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserDto>();
        Assert.Equal(User1, body!.Id);

        await _factory.WithDbContextAsync(async db =>
        {
            Assert.False(await db.Users.AnyAsync(u => u.Id == User2));
        });
    }

    [Fact]
    public async Task Email_change_in_JWT_writes_through_to_users_row()
    {
        await ClearUsersAsync();
        var clientV1 = _factory.CreateAuthenticatedClient(
            User1, email: "alice@old.example.com", displayName: "Alice O.");
        await clientV1.GetAsync("/api/users/me");

        var clientV2 = _factory.CreateAuthenticatedClient(
            User1, email: "alice@new.example.com", displayName: "Alice O.");
        var resp = await clientV2.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserDto>();
        Assert.Equal("alice@new.example.com", body!.Email);
    }

    [Fact]
    public async Task Display_name_falls_back_to_email_local_part_when_metadata_missing()
    {
        await ClearUsersAsync();
        var client = _factory.CreateAuthenticatedClient(
            User1, email: "bob@example.com", displayName: null);

        var resp = await client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UserDto>();
        Assert.Equal("bob", body!.DisplayName);
    }

    private async Task ClearUsersAsync()
    {
        await _factory.WithDbContextAsync(async db =>
        {
            db.Users.RemoveRange(db.Users);
            await db.SaveChangesAsync();
        });
    }
}
