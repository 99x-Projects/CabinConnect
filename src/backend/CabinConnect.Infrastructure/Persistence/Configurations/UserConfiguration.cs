using CabinConnect.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedNever();

        builder.Property(u => u.DisplayName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.Email)
            .HasMaxLength(320)
            .IsRequired();

        // Stored as lowercase text so future role additions don't require a
        // column migration. CHECK constraint lives in the EF migration.
        builder.Property(u => u.Role)
            .HasConversion(
                v => v.ToString().ToLowerInvariant(),
                v => (UserRole)Enum.Parse(typeof(UserRole), v, true))
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
