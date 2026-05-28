namespace CabinConnect.Domain.Cabins;

/// <summary>
/// Sensitive owner-only operational details for a cabin. Public profile DTOs
/// intentionally exclude these fields.
/// </summary>
public sealed class CabinOperationalDetails
{
    public Guid CabinId { get; set; }

    // Persisted as JSON payloads (jsonb) in Postgres.
    public string AccessCodesJson { get; set; } = "[]";

    public string EmergencyContactsJson { get; set; } = "[]";

    public string? HouseRules { get; set; }

    public DateTime UpdatedAt { get; set; }
}
