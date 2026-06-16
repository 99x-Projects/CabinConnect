using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;

namespace CabinConnect.Api.Tests;

public sealed class DeactivateCabinTests
{
    private static readonly Amenity WiFi = new(
        Guid.Parse("3ebc2282-9a9c-4d8b-a367-13de37f59c5d"),
        "Wi-Fi");

    // AC: Active cabin deactivated → isActive = false, returned with isActive false by host
    [Fact]
    public async Task DeactivateCabin_SetsIsActiveFalse_ForOwnedActiveCabin()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var cabin = await CreateCabinAsync(client);

        var response = await client.DeleteAsync($"/api/cabins/{cabin.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Host can still retrieve it, but isActive is false
        var getResponse = await client.GetAsync($"/api/cabins/{cabin.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var retrieved = await getResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(retrieved);
        Assert.False(retrieved.IsActive);
    }

    // AC: Deactivated cabin is visible to owning host with isActive false
    [Fact]
    public async Task GetCabin_ReturnsIsActiveFalse_AfterDeactivation()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var cabin = await CreateCabinAsync(client);
        await client.DeleteAsync($"/api/cabins/{cabin.Id}");

        var getResponse = await client.GetAsync($"/api/cabins/{cabin.Id}");
        var retrieved = await getResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(retrieved);
        Assert.False(retrieved.IsActive);
        Assert.Equal(cabin.Id, retrieved.Id);
    }

    // AC: Deactivating already-deactivated cabin succeeds idempotently
    [Fact]
    public async Task DeactivateCabin_IsIdempotent_WhenAlreadyDeactivated()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var cabin = await CreateCabinAsync(client);
        await client.DeleteAsync($"/api/cabins/{cabin.Id}");

        // Second deactivation must also succeed
        var secondResponse = await client.DeleteAsync($"/api/cabins/{cabin.Id}");
        Assert.Equal(HttpStatusCode.NoContent, secondResponse.StatusCode);
    }

    // AC: Cabin owned by different host → 404
    [Fact]
    public async Task DeactivateCabin_ReturnsNotFound_WhenCabinOwnedByDifferentHost()
    {
        var otherHostId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        var otherCabin = new Cabin(
            Guid.NewGuid(), otherHostId, "Other Cabin", "Desc", "Addr", 2, true, [], []);

        await using var factory = new CabinConnectApiFactory([WiFi],
            new FakeCabinRepository(new Dictionary<Guid, Amenity> { [WiFi.Id] = WiFi }, [otherCabin]));
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.DeleteAsync($"/api/cabins/{otherCabin.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // AC: Unauthenticated → 401
    [Fact]
    public async Task DeactivateCabin_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/api/cabins/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // AC: EC-011 — Deactivation succeeds regardless of bookings; cabin excluded from discovery
    // The booking system doesn't exist yet; this test verifies the cabin appears in host's
    // own list (isActive = false) but would be filtered from Guest-visible queries.
    [Fact]
    public async Task DeactivateCabin_CabinRemainsInHostList_WithIsActiveFalse()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var cabin = await CreateCabinAsync(client);
        await client.DeleteAsync($"/api/cabins/{cabin.Id}");

        var listResponse = await client.GetAsync("/api/cabins");
        var cabins = await listResponse.Content.ReadFromJsonAsync<CabinResponse[]>();
        Assert.NotNull(cabins);
        var deactivated = cabins.FirstOrDefault(c => c.Id == cabin.Id);
        Assert.NotNull(deactivated);
        Assert.False(deactivated.IsActive);
    }

    private static async Task<CabinResponse> CreateCabinAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/cabins",
            new RegisterCabinRequest(
                "Forest Retreat", "A quiet forest cabin.", "42 Pine Lane", 4,
                [WiFi.Id], null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var cabin = await response.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(cabin);
        return cabin;
    }
}
