using System.Text.Json.Serialization;

namespace CabinConnect.Api.Cabins;

/// <summary>
/// Inbound request body for <c>POST /api/cabins</c>. Note: <c>owner_id</c>
/// and <c>id</c> are intentionally absent — the server derives the owner from
/// the JWT (EC-007 / EC-F) and generates the id. If a client sends extra
/// fields they are silently ignored by the JSON binder.
/// </summary>
public sealed class CreateCabinRequest
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
