using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Data.Configurations;

public class AmenityTagConfiguration : IEntityTypeConfiguration<AmenityTag>
{
    public void Configure(EntityTypeBuilder<AmenityTag> builder)
    {
        builder.ToTable("amenity_tags");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.Name).HasColumnName("name").IsRequired();
    }
}
