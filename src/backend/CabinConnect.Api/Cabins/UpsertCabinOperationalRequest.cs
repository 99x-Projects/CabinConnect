using System.Text.Json.Serialization;

namespace CabinConnect.Api.Cabins;

public sealed class UpsertCabinOperationalRequest
{
    [JsonPropertyName("access_codes")]
    public List<AccessCodeInput>? AccessCodes { get; set; }

    [JsonPropertyName("emergency_contacts")]
    public List<EmergencyContactInput>? EmergencyContacts { get; set; }

    [JsonPropertyName("house_rules")]
    public string? HouseRules { get; set; }
}

public sealed class AccessCodeInput
{
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }
}

public sealed class EmergencyContactInput
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("relation")]
    public string? Relation { get; set; }
}
