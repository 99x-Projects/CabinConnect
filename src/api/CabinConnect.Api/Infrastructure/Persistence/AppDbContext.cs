using CabinConnect.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cabin> Cabins => Set<Cabin>();
    public DbSet<Community> Communities => Set<Community>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<CabinAmenity> CabinAmenities => Set<CabinAmenity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── Community ────────────────────────────────────────────────────────
        modelBuilder.Entity<Community>(e =>
        {
            e.ToTable("communities");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.Name).HasColumnName("name").IsRequired();
            e.Property(c => c.Region).HasColumnName("region").IsRequired();
        });

        // ── Amenity ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Amenity>(e =>
        {
            e.ToTable("amenities");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.Name).HasColumnName("name").IsRequired();
        });

        // ── Cabin ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Cabin>(e =>
        {
            e.ToTable("cabins");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.OwnerId).HasColumnName("owner_id");
            e.Property(c => c.Name).HasColumnName("name").IsRequired();
            e.Property(c => c.Street).HasColumnName("street").IsRequired();
            e.Property(c => c.PostalCode).HasColumnName("postal_code").IsRequired();
            e.Property(c => c.City).HasColumnName("city").IsRequired();
            e.Property(c => c.Country).HasColumnName("country").IsRequired().HasDefaultValue("NO");
            e.Property(c => c.CommunityId).HasColumnName("community_id");
            e.Property(c => c.Capacity).HasColumnName("capacity");
            e.Property(c => c.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
            e.Property(c => c.CreatedAt).HasColumnName("created_at");
            e.Property(c => c.CreatedBy).HasColumnName("created_by");
            e.Property(c => c.UpdatedAt).HasColumnName("updated_at");
            e.Property(c => c.UpdatedBy).HasColumnName("updated_by");

            e.HasOne(c => c.Community)
             .WithMany()
             .HasForeignKey(c => c.CommunityId);

            e.HasMany(c => c.CabinAmenities)
             .WithOne()
             .HasForeignKey(ca => ca.CabinId);
        });

        // ── CabinAmenity ─────────────────────────────────────────────────────
        modelBuilder.Entity<CabinAmenity>(e =>
        {
            e.ToTable("cabin_amenities");
            e.HasKey(ca => new { ca.CabinId, ca.AmenityId });
            e.Property(ca => ca.CabinId).HasColumnName("cabin_id");
            e.Property(ca => ca.AmenityId).HasColumnName("amenity_id");

            e.HasOne(ca => ca.Amenity)
             .WithMany()
             .HasForeignKey(ca => ca.AmenityId);
        });
    }
}
