using CabinConnect.Domain.Cabins;
using CabinConnect.Domain.Communities;
using CabinConnect.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Persistence;

/// <summary>
/// Application <see cref="DbContext"/>. Schema (tables/columns) is owned by EF Core
/// migrations under <c>CabinConnect.Infrastructure/Migrations/</c>. RLS policies,
/// triggers, functions, and seed data live in <c>supabase/migrations/</c> and
/// <c>supabase/seed.sql</c>. See <c>docs/migrations.md</c>.
/// </summary>
public class CabinConnectDbContext : DbContext
{
    public CabinConnectDbContext(DbContextOptions<CabinConnectDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Community> Communities => Set<Community>();

    public DbSet<Cabin> Cabins => Set<Cabin>();

    public DbSet<CabinOperationalDetails> CabinOperationalDetails => Set<CabinOperationalDetails>();

    public DbSet<Amenity> Amenities => Set<Amenity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CabinConnectDbContext).Assembly);
    }
}
