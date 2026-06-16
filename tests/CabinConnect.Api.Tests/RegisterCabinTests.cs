using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;

namespace CabinConnect.Api.Tests;

public sealed class RegisterCabinTests
{
    private static readonly Amenity WiFi = new(
        Guid.Parse("3ebc2282-9a9c-4d8b-a367-13de37f59c5d"),
        "Wi-Fi");

    [Fact]
    public async Task RegisterCabin_ReturnsCreatedCabin_ForValidRequest()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var request = new RegisterCabinRequest(
            "Mountain Retreat",
            "A cozy cabin in the woods.",
            "123 Forest Road",
            4,
            [WiFi.Id],
            ["Hot tub"]);

        var response = await client.PostAsJsonAsync("/api/cabins", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.True(created.IsActive);
        Assert.Equal("Mountain Retreat", created.Name);
        Assert.Equal("A cozy cabin in the woods.", created.Description);
        Assert.Equal("123 Forest Road", created.StreetAddress);
        Assert.Equal(4, created.Capacity);
        Assert.Single(created.CatalogAmenities);
        Assert.Equal(WiFi.Id, created.CatalogAmenities[0].Id);
        Assert.Single(created.CustomAmenities);
        Assert.Equal("Hot tub", created.CustomAmenities[0]);

        var getResponse = await client.GetAsync($"/api/cabins/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var retrieved = await getResponse.Content.ReadFromJsonAsync<CabinResponse>();
        Assert.NotNull(retrieved);
        Assert.True(retrieved.IsActive);
        Assert.Equal(created.Name, retrieved.Name);
        Assert.Equal(created.Description, retrieved.Description);
        Assert.Equal(created.StreetAddress, retrieved.StreetAddress);
        Assert.Equal(created.Capacity, retrieved.Capacity);
    }

    [Fact]
    public async Task RegisterCabin_ReturnsBadRequest_WhenRequiredFieldMissing()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var request = new RegisterCabinRequest(
            "",
            "Description",
            "123 Forest Road",
            4,
            [WiFi.Id],
            null);

        var response = await client.PostAsJsonAsync("/api/cabins", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Name is required", content);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(51)]
    public async Task RegisterCabin_ReturnsBadRequest_WhenCapacityOutOfRange(int capacity)
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var request = new RegisterCabinRequest(
            "Mountain Retreat",
            "Description",
            "123 Forest Road",
            capacity,
            [WiFi.Id],
            null);

        var response = await client.PostAsJsonAsync("/api/cabins", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Capacity must be between 1 and 50", content);
    }

    [Fact]
    public async Task RegisterCabin_ReturnsBadRequest_WhenCatalogAmenityDoesNotExist()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var request = new RegisterCabinRequest(
            "Mountain Retreat",
            "Description",
            "123 Forest Road",
            4,
            [Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")],
            null);

        var response = await client.PostAsJsonAsync("/api/cabins", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("catalog amenity identifiers do not exist", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RegisterCabin_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory([WiFi]);
        using var client = factory.CreateClient();

        var request = new RegisterCabinRequest(
            "Mountain Retreat",
            "Description",
            "123 Forest Road",
            4,
            [WiFi.Id],
            null);

        var response = await client.PostAsJsonAsync("/api/cabins", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
