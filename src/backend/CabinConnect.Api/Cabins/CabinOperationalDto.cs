namespace CabinConnect.Api.Cabins;

public sealed record AccessCodeDto(string Label, string Value);

public sealed record EmergencyContactDto(string Name, string Phone, string? Relation);

public sealed record CabinOperationalDto(
    IReadOnlyList<AccessCodeDto> AccessCodes,
    IReadOnlyList<EmergencyContactDto> EmergencyContacts,
    string? HouseRules,
    DateTime UpdatedAt);
