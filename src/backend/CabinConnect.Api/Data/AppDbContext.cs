using CabinConnect.Api.Domain;
using CabinConnect.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CabinConnect.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cabin> Cabins => Set<Cabin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cabin>(entity =>
        {
            entity.ToTable("cabins");

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OwnerId).HasColumnName("owner_id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200);
            entity.Property(e => e.Location).HasColumnName("location").HasMaxLength(500);
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<string>();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            // Amenities stored as PostgreSQL text[].
            // Explicit ValueConverter + ValueComparer required to bypass EF Core 8+'s
            // built-in primitive collection path, which rejects List<Amenity> (non-string enum).
            var amenityConverter = new ValueConverter<List<Amenity>, string[]>(
                v => v.Select(a => a.ToString()).ToArray(),
                v => v.Select(s => Enum.Parse<Amenity>(s)).ToList()
            );
            var amenityComparer = new ValueComparer<List<Amenity>>(
                (a, b) => a != null && b != null && a.SequenceEqual(b),
                a => a.Aggregate(0, (hash, v) => HashCode.Combine(hash, v.GetHashCode())),
                a => a.ToList()
            );
            entity.Property(e => e.Amenities)
                .HasColumnName("amenities")
                .HasColumnType("text[]")
                .HasConversion(amenityConverter, amenityComparer);
        });
    }
}
