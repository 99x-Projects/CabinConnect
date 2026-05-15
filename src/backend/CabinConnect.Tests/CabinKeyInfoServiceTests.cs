using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using NSubstitute;

namespace CabinConnect.Tests;

public class CabinKeyInfoServiceTests
{
    private readonly ICabinRepository _cabins = Substitute.For<ICabinRepository>();
    private readonly ICabinKeyInfoRepository _keyInfoRepo = Substitute.For<ICabinKeyInfoRepository>();
    private readonly IKeyInfoRevealLogRepository _revealLog = Substitute.For<IKeyInfoRevealLogRepository>();
    private readonly CabinKeyInfoService _sut;

    private static readonly Guid HostId = Guid.NewGuid();
    private static readonly Guid CabinId = Guid.NewGuid();

    private readonly Cabin _ownedCabin = new()
    {
        Id = CabinId,
        HostId = HostId,
        Name = "Pine Lodge",
        Location = "Forest",
        Capacity = 4
    };

    public CabinKeyInfoServiceTests()
    {
        _sut = new CabinKeyInfoService(_cabins, _keyInfoRepo, _revealLog);
        _cabins.GetByIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns(_ownedCabin);
    }

    // AC5: partial update — only submitted (non-null) fields are changed; others remain unchanged
    [Fact]
    public async Task UpsertAsync_PartialUpdate_PreservesUnsubmittedFields()
    {
        var existing = new CabinKeyInfo
        {
            Id = Guid.NewGuid(),
            CabinId = CabinId,
            AccessCodes = "PINE2024",
            EmergencyContacts = "+1-555-0100",
            HouseRules = "No smoking.",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _keyInfoRepo.GetByCabinIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns(existing);

        var request = new UpsertKeyInfoRequest(AccessCodes: "NEWCODE", EmergencyContacts: null, HouseRules: null);
        var result = await _sut.UpsertAsync(HostId, CabinId, request);

        existing.AccessCodes.Should().Be("NEWCODE");
        existing.EmergencyContacts.Should().Be("+1-555-0100");
        existing.HouseRules.Should().Be("No smoking.");
        await _keyInfoRepo.Received(1).SaveAsync(Arg.Any<CancellationToken>());
    }

    // AC8: GET with reveal=true logs a reveal event (cabin ID, host ID, timestamp)
    [Fact]
    public async Task GetAsync_WithReveal_LogsRevealEvent()
    {
        var keyInfo = new CabinKeyInfo
        {
            Id = Guid.NewGuid(),
            CabinId = CabinId,
            AccessCodes = "PINE2024",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _keyInfoRepo.GetByCabinIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns(keyInfo);

        await _sut.GetAsync(HostId, CabinId, reveal: true);

        await _revealLog.Received(1).LogAsync(
            Arg.Is<KeyInfoRevealLog>(l => l.CabinId == CabinId && l.HostId == HostId),
            Arg.Any<CancellationToken>());
    }

    // AC8 (negative): GET without reveal does NOT log anything
    [Fact]
    public async Task GetAsync_WithoutReveal_DoesNotLog()
    {
        _keyInfoRepo.GetByCabinIdAsync(CabinId, Arg.Any<CancellationToken>()).Returns((CabinKeyInfo?)null);

        await _sut.GetAsync(HostId, CabinId, reveal: false);

        await _revealLog.DidNotReceiveWithAnyArgs().LogAsync(default!, default);
    }

    // Masking: values > 4 chars show last 4; values ≤ 4 chars fully masked
    [Theory]
    [InlineData("PINE2024", "****2024")]
    [InlineData("1234", "****")]
    [InlineData("AB", "**")]
    [InlineData(null, null)]
    public void Mask_AppliesExpectedMasking(string? input, string? expected)
    {
        CabinKeyInfoService.Mask(input).Should().Be(expected);
    }
}
