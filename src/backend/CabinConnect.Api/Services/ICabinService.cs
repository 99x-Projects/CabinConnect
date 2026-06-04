using CabinConnect.Api.DTOs.Cabins;

namespace CabinConnect.Api.Services;

public interface ICabinService
{
    Task<CabinDto> CreateCabinAsync(Guid ownerId, CreateCabinRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CabinDto>> GetCabinsAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task<CabinDto?> GetCabinAsync(Guid ownerId, Guid cabinId, CancellationToken cancellationToken = default);
    Task<CabinDto?> UpdateCabinAsync(Guid ownerId, Guid cabinId, UpdateCabinRequest request, CancellationToken cancellationToken = default);
    Task<CabinDto?> SetCabinStatusAsync(Guid ownerId, Guid cabinId, CabinStatusAction action, CancellationToken cancellationToken = default);
}
