using CabinConnect.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Data;

public class CabinConnectDbContext : DbContext
{
    public CabinConnectDbContext(DbContextOptions<CabinConnectDbContext> options)
        : base(options)
    {
    }

    public DbSet<Cabin> Cabins => Set<Cabin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cabin>(entity =>
        {
            entity.ToTable("cabins");
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                .HasColumnName("id")
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(c => c.HostId)
                .HasColumnName("host_id")
                .HasColumnType("uuid")
                .IsRequired();

            entity.Property(c => c.Name)
                .HasColumnName("name")
                .HasColumnType("text")
                .IsRequired();

            entity.Property(c => c.Description)
                .HasColumnName("description")
                .HasColumnType("text")
                .IsRequired();

            entity.Property(c => c.Location)
                .HasColumnName("location")
                .HasColumnType("text")
                .IsRequired();

            entity.Property(c => c.BaseRate)
                .HasColumnName("base_rate")
                .HasColumnType("numeric")
                .IsRequired();

            entity.Property(c => c.MaxGuests)
                .HasColumnName("max_guests")
                .HasColumnType("integer")
                .IsRequired();

            entity.Property(c => c.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()")
                .IsRequired();
        });
    }
}
