using System.Net;
using System.Net.Http.Json;
using CabinConnect.Api.Communities;
using CabinConnect.Api.Tests.Helpers;
using CabinConnect.Domain.Communities;
using Xunit;

namespace CabinConnect.Api.Tests;

public sealed class CommunitiesEndpointTests : IClassFixture<JwtAndDbTestFactory>
{
    private static readonly Guid Caller = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    private readonly JwtAndDbTestFactory _factory;

    public CommunitiesEndpointTests(JwtAndDbTestFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GET_communities_without_token_returns_401()
    {
        var client = _factory.CreateClient();

        var resp = await client.GetAsync("/api/communities");

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task GET_communities_returns_seeded_list_alphabetical_by_name()
    {
        await _factory.WithDbContextAsync(async db =>
        {
            db.Communities.RemoveRange(db.Communities);
            await db.SaveChangesAsync();

            db.Communities.AddRange(
                new Community
                {
                    Id = Guid.NewGuid(),
                    Name = "Cedar Ridge",
                    Region = "BC",
                    Active = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new Community
                {
                    Id = Guid.NewGuid(),
                    Name = "Aspen Hollow",
                    Region = "CO",
                    Active = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new Community
                {
                    Id = Guid.NewGuid(),
                    Name = "Birch Lake",
                    Region = "ON",
                    Active = false,
                    CreatedAt = DateTime.UtcNow,
                });
            await db.SaveChangesAsync();
        });

        var client = _factory.CreateAuthenticatedClient(Caller);

        var resp = await client.GetAsync("/api/communities");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<List<CommunityDto>>();
        Assert.NotNull(body);
        Assert.Equal(3, body!.Count);
        Assert.Equal(new[] { "Aspen Hollow", "Birch Lake", "Cedar Ridge" }, body.Select(c => c.Name));

        // Inactive community is still returned — clients filter for new-cabin selection.
        var birch = body.Single(c => c.Name == "Birch Lake");
        Assert.False(birch.Active);
    }

    [Fact]
    public async Task GET_communities_empty_table_returns_200_empty_list()
    {
        await _factory.WithDbContextAsync(async db =>
        {
            db.Communities.RemoveRange(db.Communities);
            await db.SaveChangesAsync();
        });

        var client = _factory.CreateAuthenticatedClient(Caller);

        var resp = await client.GetAsync("/api/communities");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<List<CommunityDto>>();
        Assert.NotNull(body);
        Assert.Empty(body!);
    }
}
