using CabinConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AmenityTag> AmenityTags => Set<AmenityTag>();
    public DbSet<Cabin> Cabins => Set<Cabin>();
    public DbSet<CabinKeyInfo> CabinKeyInfos => Set<CabinKeyInfo>();
    public DbSet<KeyInfoRevealLog> KeyInfoRevealLogs => Set<KeyInfoRevealLog>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Hold> Holds => Set<Hold>();
    public DbSet<BlackoutDate> BlackoutDates => Set<BlackoutDate>();
    public DbSet<SeasonalRate> SeasonalRates => Set<SeasonalRate>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
