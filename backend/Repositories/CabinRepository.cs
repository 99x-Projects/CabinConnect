using CabinConnect.Api.Models;
using Dapper;
using Npgsql;

namespace CabinConnect.Api.Repositories;

public class CabinRepository : ICabinRepository
{
    private readonly string _connectionString;

    public CabinRepository(IConfiguration configuration)
    {
        _connectionString = configuration["Supabase:ConnectionString"]
            ?? throw new InvalidOperationException("Supabase:ConnectionString is not configured");
    }

    public async Task<Cabin> CreateAsync(Cabin cabin)
    {
        const string sql = """
            INSERT INTO cabins (id, name, location, capacity, amenities, owner_id, created_at)
            VALUES (@Id, @Name, @Location, @Capacity, @Amenities, @OwnerId, @CreatedAt)
            RETURNING id, name, location, capacity, amenities, owner_id, created_at
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        var result = await connection.QuerySingleAsync<CabinRow>(sql, new
        {
            cabin.Id,
            cabin.Name,
            cabin.Location,
            cabin.Capacity,
            Amenities = cabin.Amenities,
            OwnerId = cabin.OwnerId,
            CreatedAt = cabin.CreatedAt
        });

        return MapFromRow(result);
    }

    public async Task<IEnumerable<Cabin>> GetByOwnerIdAsync(Guid ownerId)
    {
        const string sql = """
            SELECT id, name, location, capacity, amenities, owner_id, created_at
            FROM cabins
            WHERE owner_id = @OwnerId
            ORDER BY created_at DESC
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        var rows = await connection.QueryAsync<CabinRow>(sql, new { OwnerId = ownerId });

        return rows.Select(MapFromRow);
    }

    private static Cabin MapFromRow(CabinRow row)
    {
        return new Cabin
        {
            Id = row.id,
            Name = row.name,
            Location = row.location,
            Capacity = row.capacity,
            Amenities = row.amenities ?? [],
            OwnerId = row.owner_id,
            CreatedAt = row.created_at
        };
    }

    private class CabinRow
    {
        public Guid id { get; set; }
        public string name { get; set; } = string.Empty;
        public string location { get; set; } = string.Empty;
        public int capacity { get; set; }
        public string[]? amenities { get; set; }
        public Guid owner_id { get; set; }
        public DateTime created_at { get; set; }
    }
}
