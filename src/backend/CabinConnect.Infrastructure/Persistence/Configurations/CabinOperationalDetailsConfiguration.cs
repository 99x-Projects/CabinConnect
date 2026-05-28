using CabinConnect.Domain.Cabins;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Persistence.Configurations;

internal sealed class CabinOperationalDetailsConfiguration : IEntityTypeConfiguration<CabinOperationalDetails>
{
    public void Configure(EntityTypeBuilder<CabinOperationalDetails> builder)
    {
        builder.ToTable("cabin_operational_details");

        builder.HasKey(x => x.CabinId);

        builder.Property(x => x.CabinId)
            .ValueGeneratedNever()
            .HasColumnName("cabin_id");

        builder.Property(x => x.AccessCodesJson)
            .HasColumnName("access_codes")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(x => x.EmergencyContactsJson)
            .HasColumnName("emergency_contacts")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(x => x.HouseRules)
            .HasColumnName("house_rules")
            .HasMaxLength(5000)
            .IsRequired(false);

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasOne<Cabin>()
            .WithOne()
            .HasForeignKey<CabinOperationalDetails>(x => x.CabinId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
