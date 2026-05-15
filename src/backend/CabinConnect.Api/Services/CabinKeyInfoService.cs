using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;

namespace CabinConnect.Api.Services;

public class CabinKeyInfoService(
    ICabinRepository cabins,
    ICabinKeyInfoRepository keyInfoRepo,
    IKeyInfoRevealLogRepository revealLog) : ICabinKeyInfoService
{
    public async Task<KeyInfoDto> GetAsync(Guid hostId, Guid cabinId, bool reveal, CancellationToken ct = default)
    {
        await VerifyOwnershipAsync(hostId, cabinId, ct);

        var keyInfo = await keyInfoRepo.GetByCabinIdAsync(cabinId, ct);

        if (reveal && keyInfo is not null)
        {
            await revealLog.LogAsync(new KeyInfoRevealLog
            {
                Id = Guid.NewGuid(),
                CabinId = cabinId,
                HostId = hostId,
                RevealedAt = DateTimeOffset.UtcNow
            }, ct);
        }

        return reveal ? ToPlaintextDto(cabinId, keyInfo) : ToMaskedDto(cabinId, keyInfo);
    }

    public async Task<KeyInfoDto> UpsertAsync(Guid hostId, Guid cabinId, UpsertKeyInfoRequest request, CancellationToken ct = default)
    {
        await VerifyOwnershipAsync(hostId, cabinId, ct);

        var existing = await keyInfoRepo.GetByCabinIdAsync(cabinId, ct);

        if (existing is null)
        {
            var newInfo = new CabinKeyInfo
            {
                Id = Guid.NewGuid(),
                CabinId = cabinId,
                AccessCodes = request.AccessCodes,
                EmergencyContacts = request.EmergencyContacts,
                HouseRules = request.HouseRules,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            await keyInfoRepo.AddAsync(newInfo, ct);
            return ToMaskedDto(cabinId, newInfo);
        }

        if (request.AccessCodes is not null) existing.AccessCodes = request.AccessCodes;
        if (request.EmergencyContacts is not null) existing.EmergencyContacts = request.EmergencyContacts;
        if (request.HouseRules is not null) existing.HouseRules = request.HouseRules;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await keyInfoRepo.SaveAsync(ct);
        return ToMaskedDto(cabinId, existing);
    }

    private async Task VerifyOwnershipAsync(Guid hostId, Guid cabinId, CancellationToken ct)
    {
        var cabin = await cabins.GetByIdAsync(cabinId, ct)
            ?? throw new CabinNotFoundException(cabinId);
        if (cabin.HostId != hostId)
            throw new CabinOwnershipException(cabinId);
    }

    internal static KeyInfoDto ToMaskedDto(Guid cabinId, CabinKeyInfo? keyInfo) => new(
        cabinId,
        Mask(keyInfo?.AccessCodes),
        Mask(keyInfo?.EmergencyContacts),
        keyInfo?.HouseRules
    );

    internal static KeyInfoDto ToPlaintextDto(Guid cabinId, CabinKeyInfo? keyInfo) => new(
        cabinId,
        keyInfo?.AccessCodes,
        keyInfo?.EmergencyContacts,
        keyInfo?.HouseRules
    );

    public static string? Mask(string? value)
    {
        if (value is null) return null;
        if (value.Length <= 4) return new string('*', value.Length);
        return new string('*', value.Length - 4) + value[^4..];
    }
}
