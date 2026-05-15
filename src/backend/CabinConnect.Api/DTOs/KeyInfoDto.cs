namespace CabinConnect.Api.DTOs;

public record KeyInfoDto(
    Guid CabinId,
    string? AccessCodes,
    string? EmergencyContacts,
    string? HouseRules
);
