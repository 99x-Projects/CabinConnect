using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Data.Configurations;

public class CabinKeyInfoConfiguration : IEntityTypeConfiguration<CabinKeyInfo>
{
    public void Configure(EntityTypeBuilder<CabinKeyInfo> builder)
    {
        builder.ToTable("cabin_key_info");
        builder.HasKey(k => k.Id);
        builder.Property(k => k.Id).HasColumnName("id");
        builder.Property(k => k.CabinId).HasColumnName("cabin_id");
        builder.Property(k => k.AccessCodes).HasColumnName("access_codes");
        builder.Property(k => k.EmergencyContacts).HasColumnName("emergency_contacts");
        builder.Property(k => k.HouseRules).HasColumnName("house_rules");
        builder.Property(k => k.CreatedAt).HasColumnName("created_at");
        builder.Property(k => k.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(k => k.CabinId).IsUnique();

        builder.HasOne<Cabin>()
               .WithOne()
               .HasForeignKey<CabinKeyInfo>(k => k.CabinId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
