using CabinConnect.Api.DTOs;

namespace CabinConnect.Api.Services;

public interface ICabinService
{
    Task<IReadOnlyList<CabinDto>> GetByHostAsync(Guid hostId, CancellationToken ct = default);
    Task<CabinDto> CreateAsync(Guid hostId, CreateCabinRequest request, CancellationToken ct = default);
    Task<CabinDto> UpdateAsync(Guid hostId, Guid cabinId, UpdateCabinRequest request, CancellationToken ct = default);
}
