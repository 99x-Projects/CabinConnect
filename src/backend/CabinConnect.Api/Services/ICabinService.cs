using CabinConnect.Api.DTOs;

namespace CabinConnect.Api.Services;

public interface ICabinService
{
    Task<CabinDto> CreateAsync(Guid hostId, CreateCabinRequest request, CancellationToken ct = default);
}
