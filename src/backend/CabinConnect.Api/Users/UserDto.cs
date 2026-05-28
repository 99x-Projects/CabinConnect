namespace CabinConnect.Api.Users;

public sealed record UserDto(
    Guid Id,
    string DisplayName,
    string Email,
    string Role,
    DateTime CreatedAt);
