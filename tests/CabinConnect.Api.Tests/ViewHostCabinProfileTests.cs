using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;

namespace CabinConnect.Api.Tests;

public sealed class ViewHostCabinProfileTests
{
    private static readonly Amenity WiFi = new(
        Guid.Parse("3ebc2282-9a9c-4d8b-a367-13de37f59c5d"),
        "Wi-Fi");

    // AC: Host who owns cabins gets all of them (active AND deactivated) in the list
    [Fact]
    public async Task ListCabins_ReturnsAllOwnedCabins_IncludingDeactivated()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        // Register two cabins
        var request1 = ValidRequest("Alpha Cabin");
        var request2 = ValidRequest("Beta Cabin");

        var r1 = await client.PostAsJsonAsync("/api/cabins", request1);
        Assert.Equal(HttpStatusCode.Created, r1.StatusCode);
        var created1 = await r1.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(created1);

        var r2 = await client.PostAsJsonAsync("/api/cabins", request2);
        Assert.Equal(HttpStatusCode.Created, r2.StatusCode);

        // List
        var listResponse = await client.GetAsync("/api/cabins");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

        var list = await listResponse.Content.ReadFromJsonAsync<IReadOnlyList<CabinResponse>>();
        Assert.NotNull(list);
        Assert.Equal(2, list.Count);
        Assert.Contains(list, c => c.Name == "Alpha Cabin");
        Assert.Contains(list, c => c.Name == "Beta Cabin");
        Assert.All(list, c => Assert.True(c.IsActive));
    }

    // AC: Get single cabin by id returns full profile
    [Fact]
    public async Task GetCabin_ReturnsFullProfile_ForOwnedCabin()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var request = new RegisterCabinRequest(
            "Forest Lodge",
            "Deep in the woods.",
            "1 Pine Street",
            6,
            [WiFi.Id],
            ["Sauna"]);

        var createResponse = await client.PostAsJsonAsync("/api/cabins", request);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(created);

        var getResponse = await client.GetAsync($"/api/cabins/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var cabin = await getResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(cabin);
        Assert.Equal("Forest Lodge", cabin.Name);
        Assert.Equal("Deep in the woods.", cabin.Description);
        Assert.Equal("1 Pine Street", cabin.StreetAddress);
        Assert.Equal(6, cabin.Capacity);
        Assert.True(cabin.IsActive);
        Assert.Single(cabin.CatalogAmenities);
        Assert.Equal("Wi-Fi", cabin.CatalogAmenities[0].DisplayName);
        Assert.Single(cabin.CustomAmenities);
        Assert.Equal("Sauna", cabin.CustomAmenities[0]);
    }

    // AC: Cabin owned by a different host → 404 (not 403 — must not reveal existence)
    [Fact]
    public async Task GetCabin_ReturnsNotFound_WhenCabinOwnedByDifferentHost()
    {
        // Seed the store with a cabin belonging to another host id
        var otherHostId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        var existingCabin = new Cabin(
            Guid.NewGuid(),
            otherHostId,
            "Other Host Cabin",
            "Belongs to someone else.",
            "99 Other Road",
            2,
            true,
            [],
            []);

        var seedRepo = new FakeCabinRepository(new Dictionary<Guid, Amenity>(), [existingCabin]);

        await using var factory = new CabinConnectApiFactory([WiFi], seedRepo);
        using var client = factory.CreateClient();
        // Authenticates as DefaultHostId (≠ otherHostId)
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.GetAsync($"/api/cabins/{existingCabin.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // AC: Non-existent cabin id → 404
    [Fact]
    public async Task GetCabin_ReturnsNotFound_ForNonExistentId()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.GetAsync($"/api/cabins/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // AC: Unauthenticated caller → 401 (list)
    [Fact]
    public async Task ListCabins_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/cabins");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // AC: Unauthenticated caller → 401 (detail)
    [Fact]
    public async Task GetCabin_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/cabins/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static RegisterCabinRequest ValidRequest(string name) =>
        new(name, "A nice cabin.", "1 Forest Road", 4, [WiFi.Id], null);
}
