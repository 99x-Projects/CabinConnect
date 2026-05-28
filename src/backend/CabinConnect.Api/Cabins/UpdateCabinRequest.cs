using System.Text.Json.Serialization;

namespace CabinConnect.Api.Cabins;

/// <summary>
/// Inbound request for full-replace update of the owner's public cabin profile.
/// Unknown fields are ignored by the JSON binder.
/// </summary>
public sealed class UpdateCabinRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("community_id")]
    public Guid? CommunityId { get; set; }

    [JsonPropertyName("capacity")]
    public int? Capacity { get; set; }

    [JsonPropertyName("amenities")]
    public List<string>? Amenities { get; set; }
}
