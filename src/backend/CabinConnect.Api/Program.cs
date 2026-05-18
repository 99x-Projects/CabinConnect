using System.Text.Json;
using CabinConnect.Api.Infrastructure;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using CabinConnect.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Supabase Cloud signs tokens with ES256. Validate via the JWKS endpoint so the
        // library handles key discovery and algorithm negotiation automatically.
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var appMetadataJson = context.Principal?.FindFirst("app_metadata")?.Value;
                if (appMetadataJson is not null)
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(appMetadataJson);
                        if (doc.RootElement.TryGetProperty("role", out var role))
                        {
                            var identity = (System.Security.Claims.ClaimsIdentity)context.Principal!.Identity!;
                            identity.AddClaim(new System.Security.Claims.Claim("app_role", role.GetString() ?? ""));
                        }
                    }
                    catch { /* ignore malformed app_metadata */ }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<ICabinRepository, CabinRepository>();
builder.Services.AddScoped<IAmenityTagRepository, AmenityTagRepository>();
builder.Services.AddScoped<ICabinKeyInfoRepository, CabinKeyInfoRepository>();
builder.Services.AddScoped<IKeyInfoRevealLogRepository, KeyInfoRevealLogRepository>();
builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
builder.Services.AddScoped<ICabinService, CabinService>();
builder.Services.AddScoped<ICabinKeyInfoService, CabinKeyInfoService>();
builder.Services.AddScoped<IInvitationService, InvitationService>();

var serviceRoleKey = builder.Configuration["Supabase:ServiceRoleKey"]
    ?? throw new InvalidOperationException("Supabase:ServiceRoleKey is not configured.");

builder.Services.AddHttpClient<ISupabaseAdminClient, SupabaseAdminClient>(client =>
{
    client.BaseAddress = new Uri(supabaseUrl);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceRoleKey}");
    client.DefaultRequestHeaders.Add("apikey", serviceRoleKey);
});

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:5173"];

    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
