using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CabinConnect.Api.Cabins;
using CabinConnect.Api.Communities;
using CabinConnect.Api.Tests.Helpers;
using CabinConnect.Domain.Cabins;
using CabinConnect.Domain.Communities;
using Xunit;

namespace CabinConnect.Api.Tests;

public sealed class CabinProfileMvpE2eTests : IClassFixture<JwtAndDbTestFactory>
{
    private static readonly Guid CommunityId = Guid.Parse("22222222-bbbb-4000-8000-000000000001");

    private readonly JwtAndDbTestFactory _factory;

    public CabinProfileMvpE2eTests(JwtAndDbTestFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task End_to_end_owner_happy_path_profile_and_operational_workflow()
    {
        var ownerId = Guid.NewGuid();
        var client = _factory.CreateAuthenticatedClient(ownerId, email: "owner@example.com", displayName: "Owner One");

        await _factory.WithDbContextAsync(async db =>
        {
            db.CabinOperationalDetails.RemoveRange(db.CabinOperationalDetails);
            db.Cabins.RemoveRange(db.Cabins);
            db.Communities.RemoveRange(db.Communities);
            db.Amenities.RemoveRange(db.Amenities);

            db.Communities.Add(new Community
            {
                Id = CommunityId,
                Name = "North Ridge",
                Region = "Norway",
                Active = true,
                CreatedAt = DateTime.UtcNow,
            });
            db.Amenities.AddRange(
                new Amenity { Code = "wifi", Name = "Wi-Fi", Active = true },
                new Amenity { Code = "parking", Name = "Parking", Active = true });

            await db.SaveChangesAsync();
        });

        // Sign-up bootstrap: authenticated owner reads own user profile, creating it lazily when absent.
        var userMeResponse = await client.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.OK, userMeResponse.StatusCode);

        var communitiesResponse = await client.GetAsync("/api/communities");
        Assert.Equal(HttpStatusCode.OK, communitiesResponse.StatusCode);
        var communities = await communitiesResponse.Content.ReadFromJsonAsync<IReadOnlyList<CommunityDto>>();
        Assert.NotNull(communities);
        Assert.Contains(communities!, c => c.Id == CommunityId);

        var registerResponse = await client.PostAsJsonAsync("/api/cabins", new
        {
            name = "Summit Cabin",
            address = "10 Alpine Road",
            community_id = CommunityId,
            capacity = 4,
            amenities = new[] { "wifi" },
        });
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var profileResponse = await client.GetAsync("/api/cabins/me");
        Assert.Equal(HttpStatusCode.OK, profileResponse.StatusCode);
        var profileBeforeUpdate = await profileResponse.Content.ReadFromJsonAsync<CabinDto>();
        Assert.NotNull(profileBeforeUpdate);

        var updateProfileResponse = await client.PutAsJsonAsync("/api/cabins/me", new
        {
            name = "Summit Cabin Premium",
            address = "10 Alpine Road",
            community_id = CommunityId,
            capacity = 5,
            amenities = new[] { "wifi", "parking" },
        });
        Assert.Equal(HttpStatusCode.OK, updateProfileResponse.StatusCode);

        var updateOperationalResponse = await client.PutAsJsonAsync("/api/cabins/me/operational", new
        {
            access_codes = new[] { new { label = "Front Door", value = "1357" } },
            emergency_contacts = new[] { new { name = "Caretaker", phone = "+47 123 45 678", relation = "On-call" } },
            house_rules = "No outdoor fires.",
        });
        Assert.Equal(HttpStatusCode.OK, updateOperationalResponse.StatusCode);

        var profileAfterOperationalResponse = await client.GetAsync("/api/cabins/me");
        Assert.Equal(HttpStatusCode.OK, profileAfterOperationalResponse.StatusCode);

        var profileJson = await profileAfterOperationalResponse.Content.ReadAsStringAsync();
        Assert.DoesNotContain("access_code", profileJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("emergency", profileJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("house_rules", profileJson, StringComparison.OrdinalIgnoreCase);

        using var operationalJson = JsonDocument.Parse(await (await client.GetAsync("/api/cabins/me/operational")).Content.ReadAsStringAsync());
        Assert.Equal("Front Door", operationalJson.RootElement.GetProperty("accessCodes")[0].GetProperty("label").GetString());
    }
}
