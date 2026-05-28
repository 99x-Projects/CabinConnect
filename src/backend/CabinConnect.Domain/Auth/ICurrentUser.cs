namespace CabinConnect.Domain.Auth;

/// <summary>
/// Resolves identity information about the current authenticated principal for the
/// request. The implementation lives in the API layer and is sourced from the
/// validated Supabase JWT.
/// </summary>
public interface ICurrentUser
{
    /// <summary>
    /// The Supabase user id (<c>sub</c> claim) parsed as a <see cref="Guid"/>.
    /// Throws <see cref="InvalidOperationException"/> if the principal is anonymous
    /// or the <c>sub</c> claim is not a valid GUID — both cases indicate an
    /// authorization bypass and must never reach domain handlers.
    /// </summary>
    Guid Id { get; }

    /// <summary>
    /// True when the request principal carries a validated JWT with a GUID <c>sub</c>.
    /// </summary>
    bool IsAuthenticated { get; }
}
