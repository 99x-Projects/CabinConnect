using CabinConnect.Api.Data;
using CabinConnect.Api.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var corsOriginsRaw = builder.Configuration["CORS_ALLOWED_ORIGINS"]
    ?? throw new InvalidOperationException(
        "Required environment variable 'CORS_ALLOWED_ORIGINS' is not set.");

var supabaseUrl = builder.Configuration["SUPABASE_URL"]
    ?? throw new InvalidOperationException(
        "Required environment variable 'SUPABASE_URL' is not set.");

var databaseUrl = builder.Configuration["DATABASE_URL"]
    ?? throw new InvalidOperationException(
        "Required environment variable 'DATABASE_URL' is not set.");

var allowedOrigins = corsOriginsRaw
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

// Supabase uses RS256 JWT Signing Keys. Authority points the middleware at the
// JWKS endpoint so public keys are fetched and cached automatically.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"{supabaseUrl.TrimEnd('/')}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5)
        };
    });

builder.Services.AddDbContext<CabinConnectDbContext>(options =>
    options.UseNpgsql(databaseUrl));

builder.Services.AddScoped<ICabinRepository, CabinRepository>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
