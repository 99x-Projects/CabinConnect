using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CabinConnect.Api.Data;

public class CabinConnectDbContextFactory : IDesignTimeDbContextFactory<CabinConnectDbContext>
{
    public CabinConnectDbContext CreateDbContext(string[] args)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException(
                "Set DATABASE_URL before running EF Core design-time commands.");

        var options = new DbContextOptionsBuilder<CabinConnectDbContext>()
            .UseNpgsql(databaseUrl)
            .Options;

        return new CabinConnectDbContext(options);
    }
}
