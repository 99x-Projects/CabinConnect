using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CabinConnect.Api.Cabins;
using CabinConnect.Api.Tests.Helpers;
using CabinConnect.Domain.Cabins;
using CabinConnect.Domain.Communities;
using Xunit;

namespace CabinConnect.Api.Tests;

public sealed class CabinProfileEndpointsTests : IClassFixture<JwtAndDbTestFactory>
{
    private static readonly Guid ActiveCommunityId = Guid.Parse("11111111-aaaa-4000-8000-000000000001");
    private static readonly Guid InactiveCommunityId = Guid.Parse("11111111-aaaa-4000-8000-000000000099");

    private readonly JwtAndDbTestFactory _factory;

    public CabinProfileEndpointsTests(JwtAndDbTestFactory factory)
    {
        _factory = factory;
    }

    private async Task SeedReferenceDataAsync(Guid? ownerId = null)
    {
        await _factory.WithDbContextAsync(async db =>
        {
            db.CabinOperationalDetails.RemoveRange(db.CabinOperationalDetails);
            db.Cabins.RemoveRange(db.Cabins);
            db.Communities.RemoveRange(db.Communities);
            db.Amenities.RemoveRange(db.Amenities);

            db.Communities.Add(new Community
            {
                Id = ActiveCommunityId,
                Name = "Aspen Hollow Resort",
                Region = "Colorado, USA",
                Active = true,
                CreatedAt = DateTime.UtcNow,
            });
            db.Communities.Add(new Community
            {
                Id = InactiveCommunityId,
                Name = "Evergreen Pines Reserve",
                Region = "Oregon, USA",
                Active = false,
                CreatedAt = DateTime.UtcNow,
            });
            db.Amenities.AddRange(
                new Amenity { Code = "wifi", Name = "Wi-Fi", Active = true },
                new Amenity { Code = "parking", Name = "Parking", Active = true },
                new Amenity { Code = "fireplace", Name = "Fireplace", Active = true });

            if (ownerId is not null)
            {
                var now = DateTime.UtcNow;
                db.Cabins.Add(new Cabin
                {
                    Id = Guid.NewGuid(),
                    OwnerId = ownerId.Value,
                    CommunityId = ActiveCommunityId,
                    Name = "Original Cabin",
                    Address = "123 Pine Trail",
                    Capacity = 4,
                    Amenities = new List<string> { "wifi" },
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }

            await db.SaveChangesAsync();
        });
    }

    [Fact]
    public async Task GET_cabins_me_without_token_returns_401()
    {
        await SeedReferenceDataAsync();
        var client = _factory.CreateClient();

        var resp = await client.GetAsync("/api/cabins/me");

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task GET_cabins_me_returns_404_when_no_cabin_registered()
    {
        await SeedReferenceDataAsync();
        var client = _factory.CreateAuthenticatedClient(Guid.NewGuid());

        var resp = await client.GetAsync("/api/cabins/me");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task GET_cabins_me_returns_public_dto_without_operational_fields()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var resp = await client.GetAsync("/api/cabins/me");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var dto = await resp.Content.ReadFromJsonAsync<CabinDto>();
        Assert.NotNull(dto);
        Assert.Equal(ownerId, dto!.OwnerId);
        Assert.Equal("Original Cabin", dto.Name);

        var json = await resp.Content.ReadAsStringAsync();
        Assert.DoesNotContain("access_code", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("emergency", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("house_rules", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PUT_cabins_me_updates_fields_and_bumps_updated_at()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var before = await client.GetFromJsonAsync<CabinDto>("/api/cabins/me");
        Assert.NotNull(before);

        var payload = new
        {
            id = Guid.NewGuid(),
            owner_id = Guid.NewGuid(),
            created_at = DateTime.UtcNow.AddYears(-1),
            updated_at = DateTime.UtcNow.AddYears(-1),
            name = "Updated Cabin",
            address = "456 Lake View",
            community_id = ActiveCommunityId,
            capacity = 8,
            amenities = new[] { "wifi", "parking" },
        };

        var resp = await client.PutAsJsonAsync("/api/cabins/me", payload);

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var dto = await resp.Content.ReadFromJsonAsync<CabinDto>();
        Assert.NotNull(dto);
        Assert.Equal("Updated Cabin", dto!.Name);
        Assert.Equal("456 Lake View", dto.Address);
        Assert.Equal(8, dto.Capacity);
        Assert.Equal(new[] { "wifi", "parking" }, dto.Amenities);
        Assert.Equal(before!.Id, dto.Id);
        Assert.Equal(ownerId, dto.OwnerId);
        Assert.True(dto.UpdatedAt > before.UpdatedAt);
    }

    [Fact]
    public async Task PUT_cabins_me_with_inactive_community_returns_400()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var payload = new
        {
            name = "Updated Cabin",
            address = "456 Lake View",
            community_id = InactiveCommunityId,
            capacity = 8,
            amenities = new[] { "wifi", "parking" },
        };

        var resp = await client.PutAsJsonAsync("/api/cabins/me", payload);

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task PUT_cabins_me_concurrent_requests_complete_without_corruption()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var payloadA = new
        {
            name = "Cabin A",
            address = "Addr A",
            community_id = ActiveCommunityId,
            capacity = 5,
            amenities = new[] { "wifi" },
        };
        var payloadB = new
        {
            name = "Cabin B",
            address = "Addr B",
            community_id = ActiveCommunityId,
            capacity = 6,
            amenities = new[] { "parking" },
        };

        var t1 = client.PutAsJsonAsync("/api/cabins/me", payloadA);
        var t2 = client.PutAsJsonAsync("/api/cabins/me", payloadB);
        await Task.WhenAll(t1, t2);

        Assert.Equal(HttpStatusCode.OK, t1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, t2.Result.StatusCode);

        var finalCabin = await client.GetFromJsonAsync<CabinDto>("/api/cabins/me");
        Assert.NotNull(finalCabin);
        Assert.Contains(finalCabin!.Name, new[] { "Cabin A", "Cabin B" });
        Assert.True((DateTime.UtcNow - finalCabin.UpdatedAt).Duration() < TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task GET_operational_returns_defaults_when_not_set()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var resp = await client.GetAsync("/api/cabins/me/operational");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        using var json = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
        Assert.Equal(0, json.RootElement.GetProperty("accessCodes").GetArrayLength());
        Assert.Equal(0, json.RootElement.GetProperty("emergencyContacts").GetArrayLength());
        Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("houseRules").ValueKind);
    }

    [Fact]
    public async Task PUT_operational_upserts_and_roundtrips()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var payload = new
        {
            access_codes = new[] { new { label = "Front Door", value = "1234" } },
            emergency_contacts = new[] { new { name = "Caretaker", phone = "+47 123 45 678", relation = "On-call" } },
            house_rules = "No shoes indoors",
        };

        var putResp = await client.PutAsJsonAsync("/api/cabins/me/operational", payload);

        Assert.Equal(HttpStatusCode.OK, putResp.StatusCode);
        var getResp = await client.GetAsync("/api/cabins/me/operational");
        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);

        using var json = JsonDocument.Parse(await getResp.Content.ReadAsStringAsync());
        var accessCodes = json.RootElement.GetProperty("accessCodes");
        Assert.Equal(1, accessCodes.GetArrayLength());
        Assert.Equal("Front Door", accessCodes[0].GetProperty("label").GetString());
        Assert.Equal("1234", accessCodes[0].GetProperty("value").GetString());
    }

    [Fact]
    public async Task PUT_operational_validation_does_not_echo_secret_values()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);

        var payload = new
        {
            access_codes = new[] { new { label = "", value = "SECRET-ACCESS-CODE" } },
            emergency_contacts = new[] { new { name = "Ops", phone = "SENSITIVE_PHONE", relation = "X" } },
            house_rules = new string('x', 5001),
        };

        var resp = await client.PutAsJsonAsync("/api/cabins/me/operational", payload);

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
        var raw = await resp.Content.ReadAsStringAsync();
        Assert.DoesNotContain("SECRET-ACCESS-CODE", raw, StringComparison.Ordinal);
        Assert.DoesNotContain("SENSITIVE_PHONE", raw, StringComparison.Ordinal);
    }

    [Fact]
    public async Task PUT_operational_logs_do_not_include_secret_values()
    {
        var ownerId = Guid.NewGuid();
        await SeedReferenceDataAsync(ownerId);
        var client = _factory.CreateAuthenticatedClient(ownerId);
        _factory.ClearCapturedLogs();

        const string secretAccessCode = "TOP-SECRET-9999";
        const string secretPhone = "+99 123 000 999";
        var payload = new
        {
            access_codes = new[] { new { label = "Owner Entry", value = secretAccessCode } },
            emergency_contacts = new[] { new { name = "Security", phone = secretPhone, relation = "Ops" } },
            house_rules = "Keep gates locked.",
        };

        var response = await client.PutAsJsonAsync("/api/cabins/me/operational", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var allLogs = string.Join("\n", _factory.GetCapturedLogs());
        Assert.DoesNotContain(secretAccessCode, allLogs, StringComparison.Ordinal);
        Assert.DoesNotContain(secretPhone, allLogs, StringComparison.Ordinal);
    }

    [Fact]
    public async Task GET_operational_without_cabin_returns_404()
    {
        await SeedReferenceDataAsync();
        var client = _factory.CreateAuthenticatedClient(Guid.NewGuid());

        var resp = await client.GetAsync("/api/cabins/me/operational");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task PUT_operational_without_token_returns_401()
    {
        await SeedReferenceDataAsync(Guid.NewGuid());
        var client = _factory.CreateClient();

        var resp = await client.PutAsJsonAsync("/api/cabins/me/operational", new
        {
            access_codes = Array.Empty<object>(),
            emergency_contacts = Array.Empty<object>(),
            house_rules = "rules",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }
}
