namespace CabinConnect.Domain.Cabins;

/// <summary>
/// Curated enum-style reference row used to validate the amenity codes a cabin
/// claims. Seeded from <c>supabase/seed.sql</c>. The <see cref="Code"/> is a
/// stable lowercase snake_case identifier referenced by <see cref="Cabin.Amenities"/>.
/// Adding a new amenity is a seed + migration change, never a free-text write.
/// </summary>
public sealed class Amenity
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public bool Active { get; set; } = true;
}
