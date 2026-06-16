using CabinConnect.Api.Application.Amenities;
using CabinConnect.Api.Application.Cabins;
using CabinConnect.Api.Domain;
using CabinConnect.Api.Tests.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace CabinConnect.Api.Tests;

internal sealed class CabinConnectApiFactory : WebApplicationFactory<Program>
{
    private readonly IReadOnlyList<Amenity> _amenities;
    private readonly ICabinRepository? _cabinRepository;

    public CabinConnectApiFactory(
        IEnumerable<Amenity> amenities,
        ICabinRepository? cabinRepository = null)
    {
        _amenities = amenities.ToArray();
        _cabinRepository = cabinRepository;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName,
                    _ => { });

            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            });

            ReplaceService<IAmenityRepository>(services, new FakeAmenityRepository(_amenities));

            if (_cabinRepository is not null)
            {
                ReplaceService<ICabinRepository>(services, _cabinRepository);
            }
            else
            {
                var catalogLookup = _amenities.ToDictionary(amenity => amenity.Id);
                ReplaceService<ICabinRepository>(services, new FakeCabinRepository(catalogLookup));
            }
        });
    }

    private static void ReplaceService<TService>(IServiceCollection services, TService implementation)
        where TService : class
    {
        var descriptor = services.FirstOrDefault(entry => entry.ServiceType == typeof(TService));
        if (descriptor is not null)
        {
            services.Remove(descriptor);
        }

        services.AddSingleton(implementation);
    }
}
