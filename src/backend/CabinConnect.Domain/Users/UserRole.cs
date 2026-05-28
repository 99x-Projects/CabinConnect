namespace CabinConnect.Domain.Users;

/// <summary>
/// Coarse-grained role attached to every <see cref="User"/>. Stored as a lowercase
/// string in Postgres so additions (`admin`, `resident`, `volunteer`, …) do not
/// require a column migration. New values added here MUST also be reflected in
/// the Postgres CHECK constraint (see EF migration <c>OwnerSignupAndCommunities</c>).
/// </summary>
public enum UserRole
{
    Owner = 0,
    Admin = 1,
    Resident = 2,
    Volunteer = 3,
}
