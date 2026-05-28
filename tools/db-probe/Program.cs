using Npgsql;

// usage:
//   dotnet run -- "<connection-string>"                       (probe)
//   dotnet run -- "<connection-string>" --apply <path.sql>    (apply SQL file)
//   dotnet run -- "<connection-string>" --query <sql>         (run SELECT, print rows)

var cs = args[0];

if (args.Length >= 3 && args[1] == "--query")
{
    var sql = args[2];
    await using var c = new NpgsqlConnection(cs);
    await c.OpenAsync();
    await using var cmd = new NpgsqlCommand(sql, c);
    await using var r = await cmd.ExecuteReaderAsync();
    while (await r.ReadAsync())
    {
        var parts = new string[r.FieldCount];
        for (var i = 0; i < r.FieldCount; i++) parts[i] = r.IsDBNull(i) ? "(null)" : r.GetValue(i).ToString() ?? "";
        Console.WriteLine(string.Join(" | ", parts));
    }
    return;
}

if (args.Length >= 3 && args[1] == "--apply")
{
    var path = args[2];
    var sql = await File.ReadAllTextAsync(path);
    try
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand(sql, c);
        var affected = await cmd.ExecuteNonQueryAsync();
        Console.WriteLine($"APPLIED ok path={path} affected={affected}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"ERR {ex.GetType().FullName}: {ex.Message}");
        if (ex.InnerException is not null)
            Console.WriteLine($"INNER {ex.InnerException.GetType().FullName}: {ex.InnerException.Message}");
        Environment.Exit(1);
    }
    return;
}

try
{
    await using var c = new NpgsqlConnection(cs);
    await c.OpenAsync();
    Console.WriteLine($"OPEN OK server={c.PostgreSqlVersion}");
}
catch (Exception ex)
{
    Console.WriteLine($"ERR {ex.GetType().FullName}: {ex.Message}");
    if (ex.InnerException is not null)
        Console.WriteLine($"INNER {ex.InnerException.GetType().FullName}: {ex.InnerException.Message}");
}
