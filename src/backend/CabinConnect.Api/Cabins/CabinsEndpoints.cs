using System.Text.RegularExpressions;
using System.Text.Json;
using CabinConnect.Domain.Auth;
using CabinConnect.Domain.Cabins;
using CabinConnect.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CabinConnect.Api.Cabins;

public static class CabinsEndpoints
{
    private const int NameMaxLength = 100;
    private const int AddressMaxLength = 250;
    private const int CapacityMin = 1;
    private const int CapacityMax = 50;
    private static readonly Regex PhonePattern = new("^\\+?[0-9 \\-]{5,30}$", RegexOptions.Compiled);

    // Strips ASCII control chars (\u0000-\u001F, \u007F). Other Unicode chars
    // (incl. extended scripts and emoji) are allowed in addresses/names.
    private static readonly Regex ControlCharPattern = new("[\\u0000-\\u001F\\u007F]", RegexOptions.Compiled);

    public static IEndpointRouteBuilder MapCabinsEndpoints(this IEndpointRouteBuilder routes)
    {
        // Auth requirement is inherited from the global fallback policy in
        // AuthServiceCollectionExtensions; no explicit RequireAuthorization() needed.
        routes.MapPost("/api/cabins", async (
                CreateCabinRequest? request,
                ICurrentUser current,
                CabinConnectDbContext db,
                CancellationToken ct) =>
            {
                if (request is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["body"] = new[] { "Request body is required." },
                    });
                }

                var errors = new Dictionary<string, List<string>>();

                // Name (AC5; EC-D).
                var name = (request.Name ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(name))
                {
                    AddError(errors, "name", "Name is required.");
                }
                else if (ContainsControlChars(name))
                {
                    AddError(errors, "name", "Name contains invalid control characters.");
                }
                else if (name.Length > NameMaxLength)
                {
                    AddError(errors, "name", $"Name must be at most {NameMaxLength} characters.");
                }

                // Address (AC5; EC-D).
                var address = (request.Address ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(address))
                {
                    AddError(errors, "address", "Address is required.");
                }
                else if (ContainsControlChars(address))
                {
                    AddError(errors, "address", "Address contains invalid control characters.");
                }
                else if (address.Length > AddressMaxLength)
                {
                    AddError(errors, "address", $"Address must be at most {AddressMaxLength} characters.");
                }

                // Capacity (AC5; EC-E).
                if (request.Capacity is null)
                {
                    AddError(errors, "capacity", "Capacity is required.");
                }
                else if (request.Capacity < CapacityMin || request.Capacity > CapacityMax)
                {
                    AddError(errors, "capacity", $"Capacity must be between {CapacityMin} and {CapacityMax}.");
                }

                // Community (AC4).
                if (request.CommunityId is null || request.CommunityId == Guid.Empty)
                {
                    AddError(errors, "community_id", "Community id is required.");
                }

                // Amenities (AC5; EC-C). De-duplicate while preserving order;
                // reject unknown or empty codes against the seeded reference table.
                var amenityCodes = new List<string>();
                if (request.Amenities is { Count: > 0 })
                {
                    var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var raw in request.Amenities)
                    {
                        var code = (raw ?? string.Empty).Trim().ToLowerInvariant();
                        if (string.IsNullOrEmpty(code))
                        {
                            AddError(errors, "amenities", "Amenity codes must be non-empty.");
                            continue;
                        }

                        if (seen.Add(code))
                        {
                            amenityCodes.Add(code);
                        }
                    }
                }

                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(ToDictionary(errors));
                }

                // Community must exist and be active (AC4; EC-B re-checked at insert).
                var community = await db.Communities
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == request.CommunityId, ct);
                if (community is null)
                {
                    AddError(errors, "community_id", "Community does not exist.");
                    return Results.ValidationProblem(ToDictionary(errors));
                }

                if (!community.Active)
                {
                    AddError(errors, "community_id", "Community is not currently active.");
                    return Results.ValidationProblem(ToDictionary(errors));
                }

                // Validate amenity codes against the seeded reference table (AC5; EC-C).
                if (amenityCodes.Count > 0)
                {
                    var validCodes = await db.Amenities
                        .AsNoTracking()
                        .Where(a => a.Active)
                        .Select(a => a.Code)
                        .ToListAsync(ct);
                    var validSet = new HashSet<string>(validCodes, StringComparer.OrdinalIgnoreCase);
                    var unknown = amenityCodes.Where(c => !validSet.Contains(c)).ToList();
                    if (unknown.Count > 0)
                    {
                        AddError(errors, "amenities", $"Unknown amenity code(s): {string.Join(", ", unknown)}.");
                        return Results.ValidationProblem(ToDictionary(errors));
                    }
                }

                // Identity is always sourced from the verified JWT (EC-007 / EC-F).
                var ownerId = current.Id;

                // AC6: enforce one cabin per owner before attempting insert so we
                // can return a clean 409 even when the DB constraint also catches it.
                var alreadyExists = await db.Cabins
                    .AsNoTracking()
                    .AnyAsync(c => c.OwnerId == ownerId, ct);
                if (alreadyExists)
                {
                    return Results.Conflict(new { error = "Owner already has a registered cabin." });
                }

                var now = DateTime.UtcNow;
                var cabin = new Cabin
                {
                    Id = Guid.NewGuid(),
                    OwnerId = ownerId,
                    CommunityId = community.Id,
                    Name = name,
                    Address = address,
                    Capacity = request.Capacity!.Value,
                    Amenities = amenityCodes,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                db.Cabins.Add(cabin);

                try
                {
                    await db.SaveChangesAsync(ct);
                }
                catch (DbUpdateException)
                {
                    // EC-A: concurrent double-create lost the race against the
                    // UNIQUE(owner_id) constraint. Surface a clean 409.
                    return Results.Conflict(new { error = "Owner already has a registered cabin." });
                }

                var dto = ToDto(cabin);
                return Results.Created($"/api/cabins/{cabin.Id}", dto);
            })
            .WithName("CreateCabin")
            .WithOpenApi();

        routes.MapGet("/api/cabins/me", async (
                ICurrentUser current,
                CabinConnectDbContext db,
                HttpContext http,
                CancellationToken ct) =>
            {
                var cabin = await db.Cabins
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.OwnerId == current.Id, ct);

                if (cabin is null)
                {
                    return Results.NotFound(new { error = "no cabin registered" });
                }

                http.Response.Headers.CacheControl = "no-store";
                return Results.Ok(ToDto(cabin));
            })
            .WithName("GetOwnCabin")
            .WithOpenApi();

        routes.MapPut("/api/cabins/me", async (
                UpdateCabinRequest? request,
                ICurrentUser current,
                CabinConnectDbContext db,
                ILoggerFactory loggerFactory,
                CancellationToken ct) =>
            {
                if (request is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["body"] = new[] { "Request body is required." },
                    });
                }

                var cabin = await db.Cabins
                    .FirstOrDefaultAsync(c => c.OwnerId == current.Id, ct);

                if (cabin is null)
                {
                    return Results.NotFound(new { error = "no cabin registered" });
                }

                var errors = new Dictionary<string, List<string>>();
                var validation = await ValidateCabinPayloadAsync(
                    request.Name,
                    request.Address,
                    request.CommunityId,
                    request.Capacity,
                    request.Amenities,
                    db,
                    errors,
                    ct);

                if (errors.Count > 0 || validation is null)
                {
                    return Results.ValidationProblem(ToDictionary(errors));
                }

                cabin.Name = validation.Value.Name;
                cabin.Address = validation.Value.Address;
                cabin.CommunityId = validation.Value.CommunityId;
                cabin.Capacity = validation.Value.Capacity;
                cabin.Amenities = validation.Value.AmenityCodes;
                cabin.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync(ct);

                loggerFactory.CreateLogger("CabinConnect.Cabins")
                    .LogInformation("cabin.updated owner_id={OwnerId} cabin_id={CabinId}", current.Id, cabin.Id);

                return Results.Ok(ToDto(cabin));
            })
            .WithName("UpdateOwnCabin")
            .WithOpenApi();

        routes.MapGet("/api/cabins/me/operational", async (
                ICurrentUser current,
                CabinConnectDbContext db,
                HttpContext http,
                ILoggerFactory loggerFactory,
                CancellationToken ct) =>
            {
                var cabin = await db.Cabins
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.OwnerId == current.Id, ct);
                if (cabin is null)
                {
                    return Results.NotFound(new { error = "no cabin registered" });
                }

                var details = await db.CabinOperationalDetails
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.CabinId == cabin.Id, ct);

                var dto = details is null
                    ? new CabinOperationalDto(Array.Empty<AccessCodeDto>(), Array.Empty<EmergencyContactDto>(), null, DateTime.UtcNow)
                    : ToOperationalDto(details);

                loggerFactory.CreateLogger("CabinConnect.Cabins")
                    .LogInformation("operational.read owner_id={OwnerId} cabin_id={CabinId}", current.Id, cabin.Id);

                http.Response.Headers.CacheControl = "no-store, no-cache";
                return Results.Ok(dto);
            })
            .WithName("GetOwnCabinOperational")
            .WithOpenApi();

        routes.MapPut("/api/cabins/me/operational", async (
                UpsertCabinOperationalRequest? request,
                ICurrentUser current,
                CabinConnectDbContext db,
                ILoggerFactory loggerFactory,
                CancellationToken ct) =>
            {
                if (request is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["body"] = new[] { "Request body is required." },
                    });
                }

                var cabin = await db.Cabins
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.OwnerId == current.Id, ct);
                if (cabin is null)
                {
                    return Results.NotFound(new { error = "no cabin registered" });
                }

                var errors = new Dictionary<string, List<string>>();
                var accessCodes = ValidateAccessCodes(request.AccessCodes, errors);
                var emergencyContacts = ValidateEmergencyContacts(request.EmergencyContacts, errors);
                var houseRules = request.HouseRules;
                if (houseRules is not null && houseRules.Length > 5000)
                {
                    AddError(errors, "house_rules", "House rules must be at most 5000 characters.");
                }

                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(ToDictionary(errors));
                }

                var now = DateTime.UtcNow;
                var existing = await db.CabinOperationalDetails
                    .FirstOrDefaultAsync(x => x.CabinId == cabin.Id, ct);

                if (existing is null)
                {
                    existing = new CabinOperationalDetails
                    {
                        CabinId = cabin.Id,
                    };
                    db.CabinOperationalDetails.Add(existing);
                }

                existing.AccessCodesJson = JsonSerializer.Serialize(accessCodes);
                existing.EmergencyContactsJson = JsonSerializer.Serialize(emergencyContacts);
                existing.HouseRules = houseRules;
                existing.UpdatedAt = now;

                await db.SaveChangesAsync(ct);

                loggerFactory.CreateLogger("CabinConnect.Cabins")
                    .LogInformation("operational.updated owner_id={OwnerId} cabin_id={CabinId}", current.Id, cabin.Id);

                return Results.Ok(new CabinOperationalDto(accessCodes, emergencyContacts, existing.HouseRules, existing.UpdatedAt));
            })
            .WithName("UpsertOwnCabinOperational")
            .WithOpenApi();

        return routes;
    }

    private static async Task<(string Name, string Address, Guid CommunityId, int Capacity, List<string> AmenityCodes)?>
        ValidateCabinPayloadAsync(
            string? requestName,
            string? requestAddress,
            Guid? requestCommunityId,
            int? requestCapacity,
            List<string>? requestAmenities,
            CabinConnectDbContext db,
            Dictionary<string, List<string>> errors,
            CancellationToken ct)
    {
        var name = (requestName ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(name))
        {
            AddError(errors, "name", "Name is required.");
        }
        else if (ContainsControlChars(name))
        {
            AddError(errors, "name", "Name contains invalid control characters.");
        }
        else if (name.Length > NameMaxLength)
        {
            AddError(errors, "name", $"Name must be at most {NameMaxLength} characters.");
        }

        var address = (requestAddress ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(address))
        {
            AddError(errors, "address", "Address is required.");
        }
        else if (ContainsControlChars(address))
        {
            AddError(errors, "address", "Address contains invalid control characters.");
        }
        else if (address.Length > AddressMaxLength)
        {
            AddError(errors, "address", $"Address must be at most {AddressMaxLength} characters.");
        }

        if (requestCapacity is null)
        {
            AddError(errors, "capacity", "Capacity is required.");
        }
        else if (requestCapacity < CapacityMin || requestCapacity > CapacityMax)
        {
            AddError(errors, "capacity", $"Capacity must be between {CapacityMin} and {CapacityMax}.");
        }

        if (requestCommunityId is null || requestCommunityId == Guid.Empty)
        {
            AddError(errors, "community_id", "Community id is required.");
        }

        var amenityCodes = new List<string>();
        if (requestAmenities is { Count: > 0 })
        {
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var raw in requestAmenities)
            {
                var code = (raw ?? string.Empty).Trim().ToLowerInvariant();
                if (string.IsNullOrEmpty(code))
                {
                    AddError(errors, "amenities", "Amenity codes must be non-empty.");
                    continue;
                }

                if (seen.Add(code))
                {
                    amenityCodes.Add(code);
                }
            }
        }

        if (errors.Count > 0)
        {
            return null;
        }

        var community = await db.Communities
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == requestCommunityId, ct);
        if (community is null)
        {
            AddError(errors, "community_id", "Community does not exist.");
            return null;
        }

        if (!community.Active)
        {
            AddError(errors, "community_id", "Community is not currently active.");
            return null;
        }

        if (amenityCodes.Count > 0)
        {
            var validCodes = await db.Amenities
                .AsNoTracking()
                .Where(a => a.Active)
                .Select(a => a.Code)
                .ToListAsync(ct);
            var validSet = new HashSet<string>(validCodes, StringComparer.OrdinalIgnoreCase);
            var unknown = amenityCodes.Where(c => !validSet.Contains(c)).ToList();
            if (unknown.Count > 0)
            {
                AddError(errors, "amenities", $"Unknown amenity code(s): {string.Join(", ", unknown)}.");
                return null;
            }
        }

        return (name, address, requestCommunityId!.Value, requestCapacity!.Value, amenityCodes);
    }

    private static IReadOnlyList<AccessCodeDto> ValidateAccessCodes(
        List<AccessCodeInput>? request,
        Dictionary<string, List<string>> errors)
    {
        if (request is null)
        {
            return Array.Empty<AccessCodeDto>();
        }

        var output = new List<AccessCodeDto>();
        var labels = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < request.Count; i += 1)
        {
            var label = (request[i].Label ?? string.Empty).Trim();
            var value = (request[i].Value ?? string.Empty).Trim();

            if (string.IsNullOrEmpty(label) || label.Length > 100 || ContainsControlChars(label))
            {
                AddError(errors, $"access_codes[{i}].label", "Access code label must be non-empty and <= 100 chars.");
            }

            if (string.IsNullOrEmpty(value) || value.Length > 100 || ContainsControlChars(value))
            {
                AddError(errors, $"access_codes[{i}].value", "Access code value must be non-empty and <= 100 chars.");
            }

            if (!string.IsNullOrEmpty(label) && !labels.Add(label))
            {
                AddError(errors, "access_codes", "Duplicate access code labels are not allowed.");
            }

            output.Add(new AccessCodeDto(label, value));
        }

        return output;
    }

    private static IReadOnlyList<EmergencyContactDto> ValidateEmergencyContacts(
        List<EmergencyContactInput>? request,
        Dictionary<string, List<string>> errors)
    {
        if (request is null)
        {
            return Array.Empty<EmergencyContactDto>();
        }

        var output = new List<EmergencyContactDto>();
        for (var i = 0; i < request.Count; i += 1)
        {
            var name = (request[i].Name ?? string.Empty).Trim();
            var phone = (request[i].Phone ?? string.Empty).Trim();
            var relation = string.IsNullOrWhiteSpace(request[i].Relation) ? null : request[i].Relation!.Trim();

            if (string.IsNullOrEmpty(name) || name.Length > 100 || ContainsControlChars(name))
            {
                AddError(errors, $"emergency_contacts[{i}].name", "Emergency contact name must be non-empty and <= 100 chars.");
            }

            if (string.IsNullOrEmpty(phone) || !PhonePattern.IsMatch(phone))
            {
                AddError(errors, $"emergency_contacts[{i}].phone", "Emergency contact phone format is invalid.");
            }

            if (relation is not null && (relation.Length > 50 || ContainsControlChars(relation)))
            {
                AddError(errors, $"emergency_contacts[{i}].relation", "Emergency contact relation must be <= 50 chars.");
            }

            output.Add(new EmergencyContactDto(name, phone, relation));
        }

        return output;
    }

    private static CabinOperationalDto ToOperationalDto(CabinOperationalDetails details)
    {
        var accessCodes = JsonSerializer.Deserialize<List<AccessCodeDto>>(details.AccessCodesJson)
            ?? new List<AccessCodeDto>();
        var emergencyContacts = JsonSerializer.Deserialize<List<EmergencyContactDto>>(details.EmergencyContactsJson)
            ?? new List<EmergencyContactDto>();

        return new CabinOperationalDto(accessCodes, emergencyContacts, details.HouseRules, details.UpdatedAt);
    }

    private static CabinDto ToDto(Cabin cabin) => new(
        cabin.Id,
        cabin.OwnerId,
        cabin.CommunityId,
        cabin.Name,
        cabin.Address,
        cabin.Capacity,
        cabin.Amenities.AsReadOnly(),
        cabin.CreatedAt,
        cabin.UpdatedAt);

    private static bool ContainsControlChars(string value) => ControlCharPattern.IsMatch(value);

    private static void AddError(Dictionary<string, List<string>> errors, string field, string message)
    {
        if (!errors.TryGetValue(field, out var list))
        {
            list = new List<string>();
            errors[field] = list;
        }
        list.Add(message);
    }

    private static Dictionary<string, string[]> ToDictionary(Dictionary<string, List<string>> errors) =>
        errors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray());
}
