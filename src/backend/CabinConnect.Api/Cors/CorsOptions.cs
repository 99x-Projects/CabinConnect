namespace CabinConnect.Api.Cors;

/// <summary>
/// Strongly-typed options bound from the <c>Cors</c> configuration section.
/// </summary>
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    /// <summary>
    /// Explicit list of allowed frontend origins (e.g. <c>https://app.example.com</c>).
    /// Wildcard <c>*</c> is rejected at startup. Must not be empty in any environment
    /// other than `EnvironmentName == "Testing"`.
    /// </summary>
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();

    /// <summary>
    /// When true, the policy includes <c>AllowCredentials()</c>. Combined with <c>*</c>
    /// origins, this is a hard startup failure.
    /// </summary>
    public bool AllowCredentials { get; set; } = true;
}
