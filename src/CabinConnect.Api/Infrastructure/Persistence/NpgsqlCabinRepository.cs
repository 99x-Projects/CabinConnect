using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using Npgsql;

namespace CabinConnect.Api.Infrastructure.Persistence;

public sealed class NpgsqlCabinRepository(IConfiguration configuration) : ICabinRepository
{
    public async Task<IReadOnlyList<Cabin>> GetAllForHostAsync(
        Guid hostId,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);

        await using var command = new NpgsqlCommand(
            """
            SELECT id, host_id, name, description, street_address, capacity, is_active
            FROM cabins
            WHERE host_id = @host_id
            ORDER BY name;
            """,
            connection);

        command.Parameters.AddWithValue("host_id", hostId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var stubs = new List<Cabin>();
        while (await reader.ReadAsync(cancellationToken))
        {
            stubs.Add(ReadCabin(reader));
        }

        await reader.CloseAsync();

        var cabins = new List<Cabin>(stubs.Count);
        foreach (var stub in stubs)
        {
            var catalogAmenities = await GetCatalogAmenitiesAsync(connection, stub.Id, cancellationToken);
            var customAmenities = await GetCustomAmenitiesAsync(connection, stub.Id, cancellationToken);
            cabins.Add(stub with { CatalogAmenities = catalogAmenities, CustomAmenities = customAmenities });
        }

        return cabins;
    }

    public async Task<Cabin?> GetByIdForHostAsync(
        Guid cabinId,
        Guid hostId,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);

        await using var command = new NpgsqlCommand(
            """
            SELECT id, host_id, name, description, street_address, capacity, is_active
            FROM cabins
            WHERE id = @cabin_id AND host_id = @host_id;
            """,
            connection);

        command.Parameters.AddWithValue("cabin_id", cabinId);
        command.Parameters.AddWithValue("host_id", hostId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var cabin = ReadCabin(reader);
        await reader.CloseAsync();

        var catalogAmenities = await GetCatalogAmenitiesAsync(connection, cabinId, cancellationToken);
        var customAmenities = await GetCustomAmenitiesAsync(connection, cabinId, cancellationToken);

        return cabin with
        {
            CatalogAmenities = catalogAmenities,
            CustomAmenities = customAmenities
        };
    }

    public async Task<bool> DeactivateAsync(
        Guid cabinId,
        Guid hostId,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);

        await using var command = new NpgsqlCommand(
            """
            UPDATE cabins
            SET is_active = false,
                updated_at = timezone('utc', now())
            WHERE id = @cabin_id AND host_id = @host_id;
            """,
            connection);

        command.Parameters.AddWithValue("cabin_id", cabinId);
        command.Parameters.AddWithValue("host_id", hostId);

        var affected = await command.ExecuteNonQueryAsync(cancellationToken);
        return affected > 0;
    }

    public async Task<Cabin?> UpdateAsync(
        Guid cabinId,
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);

        // Verify ownership before touching data
        await using (var checkOwnership = new NpgsqlCommand(
            """
            SELECT id FROM cabins WHERE id = @cabin_id AND host_id = @host_id;
            """,
            connection))
        {
            checkOwnership.Parameters.AddWithValue("cabin_id", cabinId);
            checkOwnership.Parameters.AddWithValue("host_id", hostId);
            var exists = await checkOwnership.ExecuteScalarAsync(cancellationToken);
            if (exists is null)
            {
                return null;
            }
        }

        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            await using (var updateCabin = new NpgsqlCommand(
                """
                UPDATE cabins
                SET name = @name,
                    description = @description,
                    street_address = @street_address,
                    capacity = @capacity,
                    updated_at = timezone('utc', now())
                WHERE id = @cabin_id AND host_id = @host_id;
                """,
                connection,
                transaction))
            {
                updateCabin.Parameters.AddWithValue("cabin_id", cabinId);
                updateCabin.Parameters.AddWithValue("host_id", hostId);
                updateCabin.Parameters.AddWithValue("name", name);
                updateCabin.Parameters.AddWithValue("description", description);
                updateCabin.Parameters.AddWithValue("street_address", streetAddress);
                updateCabin.Parameters.AddWithValue("capacity", capacity);
                await updateCabin.ExecuteNonQueryAsync(cancellationToken);
            }

            // Replace amenity selections entirely
            await using (var deleteAmenities = new NpgsqlCommand(
                "DELETE FROM cabin_amenities WHERE cabin_id = @cabin_id;",
                connection,
                transaction))
            {
                deleteAmenities.Parameters.AddWithValue("cabin_id", cabinId);
                await deleteAmenities.ExecuteNonQueryAsync(cancellationToken);
            }

            await using (var deleteCustom = new NpgsqlCommand(
                "DELETE FROM cabin_custom_amenities WHERE cabin_id = @cabin_id;",
                connection,
                transaction))
            {
                deleteCustom.Parameters.AddWithValue("cabin_id", cabinId);
                await deleteCustom.ExecuteNonQueryAsync(cancellationToken);
            }

            foreach (var amenityId in catalogAmenityIds)
            {
                await using var insertCatalog = new NpgsqlCommand(
                    "INSERT INTO cabin_amenities (cabin_id, amenity_id) VALUES (@cabin_id, @amenity_id);",
                    connection,
                    transaction);
                insertCatalog.Parameters.AddWithValue("cabin_id", cabinId);
                insertCatalog.Parameters.AddWithValue("amenity_id", amenityId);
                await insertCatalog.ExecuteNonQueryAsync(cancellationToken);
            }

            foreach (var customAmenity in customAmenities)
            {
                await using var insertCustom = new NpgsqlCommand(
                    "INSERT INTO cabin_custom_amenities (id, cabin_id, display_name) VALUES (@id, @cabin_id, @display_name);",
                    connection,
                    transaction);
                insertCustom.Parameters.AddWithValue("id", Guid.NewGuid());
                insertCustom.Parameters.AddWithValue("cabin_id", cabinId);
                insertCustom.Parameters.AddWithValue("display_name", customAmenity);
                await insertCustom.ExecuteNonQueryAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return await GetByIdForHostAsync(cabinId, hostId, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Cabin> CreateAsync(
        Guid hostId,
        string name,
        string description,
        string streetAddress,
        int capacity,
        IReadOnlyList<Guid> catalogAmenityIds,
        IReadOnlyList<string> customAmenities,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            var cabinId = Guid.NewGuid();

            await using (var insertCabin = new NpgsqlCommand(
                             """
                             INSERT INTO cabins (
                                 id, host_id, name, description, street_address, capacity, is_active
                             )
                             VALUES (
                                 @id, @host_id, @name, @description, @street_address, @capacity, true
                             );
                             """,
                             connection,
                             transaction))
            {
                insertCabin.Parameters.AddWithValue("id", cabinId);
                insertCabin.Parameters.AddWithValue("host_id", hostId);
                insertCabin.Parameters.AddWithValue("name", name);
                insertCabin.Parameters.AddWithValue("description", description);
                insertCabin.Parameters.AddWithValue("street_address", streetAddress);
                insertCabin.Parameters.AddWithValue("capacity", capacity);
                await insertCabin.ExecuteNonQueryAsync(cancellationToken);
            }

            foreach (var amenityId in catalogAmenityIds)
            {
                await using var insertCatalogAmenity = new NpgsqlCommand(
                    """
                    INSERT INTO cabin_amenities (cabin_id, amenity_id)
                    VALUES (@cabin_id, @amenity_id);
                    """,
                    connection,
                    transaction);

                insertCatalogAmenity.Parameters.AddWithValue("cabin_id", cabinId);
                insertCatalogAmenity.Parameters.AddWithValue("amenity_id", amenityId);
                await insertCatalogAmenity.ExecuteNonQueryAsync(cancellationToken);
            }

            foreach (var customAmenity in customAmenities)
            {
                await using var insertCustomAmenity = new NpgsqlCommand(
                    """
                    INSERT INTO cabin_custom_amenities (id, cabin_id, display_name)
                    VALUES (@id, @cabin_id, @display_name);
                    """,
                    connection,
                    transaction);

                insertCustomAmenity.Parameters.AddWithValue("id", Guid.NewGuid());
                insertCustomAmenity.Parameters.AddWithValue("cabin_id", cabinId);
                insertCustomAmenity.Parameters.AddWithValue("display_name", customAmenity);
                await insertCustomAmenity.ExecuteNonQueryAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return (await GetByIdForHostAsync(cabinId, hostId, cancellationToken))!;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static Cabin ReadCabin(NpgsqlDataReader reader) =>
        new(
            reader.GetGuid(0),
            reader.GetGuid(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.GetString(4),
            reader.GetInt32(5),
            reader.GetBoolean(6),
            [],
            []);

    private static async Task<IReadOnlyList<Amenity>> GetCatalogAmenitiesAsync(
        NpgsqlConnection connection,
        Guid cabinId,
        CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand(
            """
            SELECT a.id, a.display_name
            FROM cabin_amenities ca
            INNER JOIN amenities a ON a.id = ca.amenity_id
            WHERE ca.cabin_id = @cabin_id
            ORDER BY a.display_name;
            """,
            connection);

        command.Parameters.AddWithValue("cabin_id", cabinId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var amenities = new List<Amenity>();
        while (await reader.ReadAsync(cancellationToken))
        {
            amenities.Add(new Amenity(reader.GetGuid(0), reader.GetString(1)));
        }

        return amenities;
    }

    private static async Task<IReadOnlyList<string>> GetCustomAmenitiesAsync(
        NpgsqlConnection connection,
        Guid cabinId,
        CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand(
            """
            SELECT display_name
            FROM cabin_custom_amenities
            WHERE cabin_id = @cabin_id
            ORDER BY display_name;
            """,
            connection);

        command.Parameters.AddWithValue("cabin_id", cabinId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var amenities = new List<string>();
        while (await reader.ReadAsync(cancellationToken))
        {
            amenities.Add(reader.GetString(0));
        }

        return amenities;
    }

    private async Task<NpgsqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString("CabinConnectDb");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'CabinConnectDb' is required to access cabins.");
        }

        var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }
}
