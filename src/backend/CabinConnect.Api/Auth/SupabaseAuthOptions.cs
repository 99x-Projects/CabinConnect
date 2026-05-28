namespace CabinConnect.Api.Auth;

/// <summary>
/// Strongly-typed options bound from the <c>SupabaseAuth</c> configuration section.
/// </summary>
public sealed class SupabaseAuthOptions
{
    public const string SectionName = "SupabaseAuth";

    /// <summary>
    /// The Supabase project URL, used as the JWT issuer / authority
    /// (e.g. <c>https://abc123.supabase.co</c>).
    /// </summary>
    public string Authority { get; set; } = string.Empty;

    /// <summary>
    /// Required audience claim value. Supabase issues tokens with <c>aud=authenticated</c>
    /// by default.
    /// </summary>
    public string Audience { get; set; } = "authenticated";

    /// <summary>
    /// JWKS endpoint to fetch signing keys from. If empty, derived from
    /// <c>Authority</c>: <c>{Authority}/auth/v1/.well-known/jwks.json</c>.
    /// </summary>
    public string JwksUrl { get; set; } = string.Empty;
}
