namespace CabinConnect.Api.DTOs;

public record UpsertKeyInfoRequest(
    string? AccessCodes,
    string? EmergencyContacts,
    string? HouseRules
);
