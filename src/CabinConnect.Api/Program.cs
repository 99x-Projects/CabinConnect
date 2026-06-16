using CabinConnect.Api.Application.Amenities;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabaseUrl = builder.Configuration["Supabase:Url"]?.TrimEnd('/');
        var authority = builder.Configuration["Supabase:JwtAuthority"]
            ?? (string.IsNullOrWhiteSpace(supabaseUrl) ? null : $"{supabaseUrl}/auth/v1");
        var audience = builder.Configuration["Supabase:JwtAudience"];

        if (!string.IsNullOrWhiteSpace(authority))
        {
            options.Authority = authority;
        }

        if (!string.IsNullOrWhiteSpace(audience))
        {
            options.Audience = audience;
        }

        options.TokenValidationParameters.NameClaimType = "sub";
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<IAmenityRepository, NpgsqlAmenityRepository>();
builder.Services.AddScoped<AmenityService>();
builder.Services.AddScoped<ICabinRepository, NpgsqlCabinRepository>();
builder.Services.AddScoped<CabinRegistrationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program;
