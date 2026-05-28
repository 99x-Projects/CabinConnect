using CabinConnect.Domain.Cabins;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Persistence.Configurations;

internal sealed class CabinConfiguration : IEntityTypeConfiguration<Cabin>
{
    public void Configure(EntityTypeBuilder<Cabin> builder)
    {
        builder.ToTable("cabins");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.OwnerId).IsRequired();
        builder.Property(c => c.CommunityId).IsRequired();

        builder.Property(c => c.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Address)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(c => c.Capacity).IsRequired();

        // Native Postgres text[] via Npgsql; codes are validated against the
        // seeded amenities reference table at the API boundary (not by FK), so
        // adding a new amenity is a seed-only change.
        builder.Property(c => c.Amenities)
            .HasColumnType("text[]")
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        // One cabin per owner for MVP — see cabin-register Scope.
        builder.HasIndex(c => c.OwnerId).IsUnique();
        builder.HasIndex(c => c.CommunityId);
    }
}
