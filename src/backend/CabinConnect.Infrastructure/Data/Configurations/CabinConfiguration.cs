using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Data.Configurations;

public class CabinConfiguration : IEntityTypeConfiguration<Cabin>
{
    public void Configure(EntityTypeBuilder<Cabin> builder)
    {
        builder.ToTable("cabins");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(512).IsRequired();
        builder.Property(c => c.Location).HasColumnName("location").IsRequired();
        builder.Property(c => c.Capacity).HasColumnName("capacity");
        builder.Property(c => c.Description).HasColumnName("description");
        builder.Property(c => c.HostId).HasColumnName("host_id");
        builder.Property(c => c.BaseRate).HasColumnName("base_rate").HasColumnType("numeric(10,2)");
        builder.Property(c => c.IsActive).HasColumnName("is_active");
        builder.Property(c => c.Version).HasColumnName("version").IsConcurrencyToken();
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(c => new { c.HostId, c.Name }).IsUnique();

        builder.HasMany(c => c.AmenityTags)
               .WithMany()
               .UsingEntity(j =>
               {
                   j.ToTable("cabin_amenity_tags");
                   j.Property<Guid>("CabinId").HasColumnName("cabin_id");
                   j.Property<Guid>("AmenityTagId").HasColumnName("amenity_tag_id");
               });
    }
}
