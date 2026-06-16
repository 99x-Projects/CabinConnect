using System.Net;
using System.Net.Http.Headers;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;

namespace CabinConnect.Api.Tests;

public sealed class AmenitiesEndpointTests
{
    [Fact]
    public async Task GetAmenities_ReturnsSeededAmenities_ForAuthenticatedHost()
    {
        var amenities = new[]
        {
            new Amenity(Guid.Parse("3ebc2282-9a9c-4d8b-a367-13de37f59c5d"), "Wi-Fi"),
            new Amenity(Guid.Parse("1294a906-605d-4ce8-b53c-b58844da3e03"), "Fireplace")
        };

        await using var factory = new CabinConnectApiFactory(amenities);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.GetAsync("/api/amenities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"displayName\":\"Wi-Fi\"", content);
        Assert.Contains("\"displayName\":\"Fireplace\"", content);
    }

    [Fact]
    public async Task GetAmenities_ReturnsUnauthorized_ForUnauthenticatedCaller()
    {
        await using var factory = new CabinConnectApiFactory(Array.Empty<Amenity>());
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/amenities");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAmenities_ReturnsEmptyList_WhenCatalogIsEmpty()
    {
        await using var factory = new CabinConnectApiFactory(Array.Empty<Amenity>());
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName, "host-token");

        var response = await client.GetAsync("/api/amenities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Equal("[]", content);
    }
}
