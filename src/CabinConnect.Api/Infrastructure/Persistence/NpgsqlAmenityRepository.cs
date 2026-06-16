using CabinConnect.Api.Application.Amenities;
using CabinConnect.Api.Domain;
using Npgsql;

namespace CabinConnect.Api.Infrastructure.Persistence;

public sealed class NpgsqlAmenityRepository(IConfiguration configuration) : IAmenityRepository
{
    private const string AmenitiesQuery = """
        SELECT id, display_name
        FROM amenities
        ORDER BY display_name;
        """;

    public async Task<IReadOnlyList<Amenity>> GetAllAsync(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString("CabinConnectDb");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'CabinConnectDb' is required to read amenities.");
        }

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(AmenitiesQuery, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var amenities = new List<Amenity>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var id = reader.GetGuid(0);
            var displayName = reader.GetString(1);
            amenities.Add(new Amenity(id, displayName));
        }

        return amenities;
    }

    public async Task<bool> AllExistAsync(IReadOnlyList<Guid> amenityIds, CancellationToken cancellationToken)
    {
        if (amenityIds.Count == 0)
        {
            return true;
        }

        var connectionString = configuration.GetConnectionString("CabinConnectDb");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'CabinConnectDb' is required to validate amenities.");
        }

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(
            """
            SELECT COUNT(*)
            FROM amenities
            WHERE id = ANY(@ids);
            """,
            connection);

        command.Parameters.AddWithValue("ids", amenityIds.ToArray());

        var count = (long?)await command.ExecuteScalarAsync(cancellationToken) ?? 0;
        return count == amenityIds.Count;
    }
}
