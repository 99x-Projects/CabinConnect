using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;

namespace CabinConnect.Api.Tests;

public sealed class UpdateCabinProfileTests
{
    private static readonly Amenity WiFi = new(
        Guid.Parse("3ebc2282-9a9c-4d8b-a367-13de37f59c5d"),
        "Wi-Fi");

    private static readonly Amenity Fireplace = new(
        Guid.Parse("1294a906-605d-4ce8-b53c-b58844da3e03"),
        "Fireplace");

    // AC: Valid update returns updated profile
    [Fact]
    public async Task UpdateCabin_ReturnsUpdatedProfile_ForValidRequest()
    {
        await using var factory = new CabinConnectApiFactory([WiFi, Fireplace]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var createResponse = await client.PostAsJsonAsync("/api/cabins", new RegisterCabinRequest(
            "Original Name", "Original desc.", "1 Old Road", 3, [WiFi.Id], null));
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(created);

        var updateRequest = new UpdateCabinRequest(
            "Updated Name", "Updated description.", "2 New Street", 8, [Fireplace.Id], ["Jacuzzi"]);

        var updateResponse = await client.PutAsJsonAsync($"/api/cabins/{created.Id}", updateRequest);

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(updated);
        Assert.Equal("Updated Name", updated.Name);
        Assert.Equal("Updated description.", updated.Description);
        Assert.Equal("2 New Street", updated.StreetAddress);
        Assert.Equal(8, updated.Capacity);
        Assert.Single(updated.CatalogAmenities);
        Assert.Equal("Fireplace", updated.CatalogAmenities[0].DisplayName);
        Assert.Single(updated.CustomAmenities);
        Assert.Equal("Jacuzzi", updated.CustomAmenities[0]);
        // isActive must be unchanged
        Assert.True(updated.IsActive);
    }

    // AC: Clearing a required field → 400, cabin unchanged
    [Theory]
    [InlineData("", "Description", "123 Road")]
    [InlineData("Name", "", "123 Road")]
    [InlineData("Name", "Description", "")]
    public async Task UpdateCabin_ReturnsBadRequest_WhenRequiredFieldCleared(
        string name, string description, string streetAddress)
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var created = await CreateCabinAsync(client);

        var updateRequest = new UpdateCabinRequest(name, description, streetAddress, 4, [WiFi.Id], null);
        var response = await client.PutAsJsonAsync($"/api/cabins/{created.Id}", updateRequest);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        // Cabin must be unchanged
        var getResponse = await client.GetAsync($"/api/cabins/{created.Id}");
        var unchanged = await getResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(unchanged);
        Assert.Equal("Original Cabin", unchanged.Name);
    }

    // AC: Capacity out of range → 400
    [Theory]
    [InlineData(0)]
    [InlineData(51)]
    public async Task UpdateCabin_ReturnsBadRequest_WhenCapacityOutOfRange(int capacity)
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var created = await CreateCabinAsync(client);

        var response = await client.PutAsJsonAsync(
            $"/api/cabins/{created.Id}",
            new UpdateCabinRequest("Name", "Desc", "Addr", capacity, [WiFi.Id], null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Capacity must be between 1 and 50", content);
    }

    // AC: Non-existent catalog amenity → 400
    [Fact]
    public async Task UpdateCabin_ReturnsBadRequest_WhenCatalogAmenityDoesNotExist()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var created = await CreateCabinAsync(client);

        var response = await client.PutAsJsonAsync(
            $"/api/cabins/{created.Id}",
            new UpdateCabinRequest("Name", "Desc", "Addr", 4,
                [Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")], null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // AC: Cabin owned by different host → 404
    [Fact]
    public async Task UpdateCabin_ReturnsNotFound_WhenCabinOwnedByDifferentHost()
    {
        var otherHostId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        var otherCabin = new Cabin(
            Guid.NewGuid(), otherHostId, "Other Cabin", "Desc", "Addr", 2, true, [], []);

        await using var factory = new CabinConnectApiFactory([WiFi],
            new FakeCabinRepository(new Dictionary<Guid, Amenity> { [WiFi.Id] = WiFi }, [otherCabin]));
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.PutAsJsonAsync(
            $"/api/cabins/{otherCabin.Id}",
            new UpdateCabinRequest("X", "Y", "Z", 2, [WiFi.Id], null));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // AC: Unauthenticated → 401
    [Fact]
    public async Task UpdateCabin_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync(
            $"/api/cabins/{Guid.NewGuid()}",
            new UpdateCabinRequest("Name", "Desc", "Addr", 4, [WiFi.Id], null));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static async Task<CabinResponse> CreateCabinAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/cabins",
            new RegisterCabinRequest(
                "Original Cabin", "Original description.", "1 Forest Road", 4,
                [WiFi.Id], null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var cabin = await response.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(cabin);
        return cabin;
    }
}
