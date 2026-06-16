namespace CabinConnect.Api.Application.Amenities;

public sealed class AmenityService(IAmenityRepository amenityRepository)
{
    public async Task<IReadOnlyList<AmenityResponse>> GetCatalogAsync(CancellationToken cancellationToken)
    {
        var amenities = await amenityRepository.GetAllAsync(cancellationToken);

        return amenities
            .Select(amenity => new AmenityResponse(amenity.Id, amenity.DisplayName))
            .ToArray();
    }
}
