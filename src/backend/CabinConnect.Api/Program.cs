using System.Text.Json.Serialization;
using CabinConnect.Api.Data;
using CabinConnect.Api.Repositories;
using CabinConnect.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// EF Core — Supabase PostgreSQL via Npgsql
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("ConnectionStrings:Default is required.")));

// JWT auth — Supabase uses ES256 (asymmetric ECDSA); use JWKS Authority, not symmetric key (ADR-005)
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is required.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new()
        {
            ValidateAudience = false,
            ValidIssuer = $"{supabaseUrl}/auth/v1"
        };
    });

builder.Services.AddAuthorization();

// CORS — allow the React dev server; production origins come from config
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    }));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHealthChecks();

// DI
builder.Services.AddScoped<ICabinRepository, CabinRepository>();
builder.Services.AddScoped<ICabinService, CabinService>();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
