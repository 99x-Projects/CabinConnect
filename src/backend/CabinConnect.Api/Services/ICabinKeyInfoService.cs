using CabinConnect.Api.DTOs;

namespace CabinConnect.Api.Services;

public interface ICabinKeyInfoService
{
    Task<KeyInfoDto> GetAsync(Guid hostId, Guid cabinId, bool reveal, CancellationToken ct = default);
    Task<KeyInfoDto> UpsertAsync(Guid hostId, Guid cabinId, UpsertKeyInfoRequest request, CancellationToken ct = default);
}
