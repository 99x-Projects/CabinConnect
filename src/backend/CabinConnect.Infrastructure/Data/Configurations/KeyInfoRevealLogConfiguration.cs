using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Data.Configurations;

public class KeyInfoRevealLogConfiguration : IEntityTypeConfiguration<KeyInfoRevealLog>
{
    public void Configure(EntityTypeBuilder<KeyInfoRevealLog> builder)
    {
        builder.ToTable("key_info_reveal_log");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.CabinId).HasColumnName("cabin_id");
        builder.Property(l => l.HostId).HasColumnName("host_id");
        builder.Property(l => l.RevealedAt).HasColumnName("revealed_at");
    }
}
