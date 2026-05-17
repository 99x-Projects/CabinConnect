using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CabinConnect.Infrastructure.Data.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.UserId).IsRequired();
        builder.Property(u => u.Email).IsRequired();
        builder.Property(u => u.Role).IsRequired();
        builder.Property(u => u.Status).IsRequired();
        builder.Property(u => u.InvitedAt).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
    }
}
