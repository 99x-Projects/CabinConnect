using CabinConnect.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace CabinConnect.Api.Controllers;

[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly CabinConnectDbContext _db;
    private readonly ILogger<HealthController> _logger;

    public HealthController(CabinConnectDbContext db, ILogger<HealthController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet("/health")]
    public async Task<IActionResult> Get()
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "unknown";
        var dbHealthy = await CheckDatabaseAsync();

        var response = new
        {
            api = "CabinConnect",
            version,
            status = dbHealthy ? "healthy" : "unhealthy",
            database = dbHealthy ? "healthy" : "unhealthy"
        };

        return dbHealthy ? Ok(response) : StatusCode(503, response);
    }

    private async Task<bool> CheckDatabaseAsync()
    {
        try
        {
            await _db.Database.ExecuteSqlRawAsync("SELECT 1");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return false;
        }
    }
}
