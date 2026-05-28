using CabinConnect.Domain.Cabins;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Persistence.Configurations;

internal sealed class AmenityConfiguration : IEntityTypeConfiguration<Amenity>
{
    public void Configure(EntityTypeBuilder<Amenity> builder)
    {
        builder.ToTable("amenities");

        builder.HasKey(a => a.Code);
        builder.Property(a => a.Code)
            .HasMaxLength(64)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(a => a.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(a => a.Active).IsRequired();
    }
}
