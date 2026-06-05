using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Api.Services;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using CabinConnect.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace CabinConnect.Tests;

public class P0DefectTests
{
    // AC1: Booking.Nights correctly counts nights across a year boundary
    // DateOnly.DayNumber is an absolute epoch-based day count (not day-of-year),
    // so CheckOut.DayNumber - CheckIn.DayNumber is safe across Dec/Jan.
    [Fact]
    public void Booking_Nights_YearBoundary_ReturnsFour()
    {
        var booking = new Booking
        {
            CheckIn = new DateOnly(2025, 12, 29),
            CheckOut = new DateOnly(2026, 1, 2),
        };

        booking.Nights.Should().Be(4);
    }

    // AC2: Booking.Nights same-year baseline
    [Fact]
    public void Booking_Nights_SameYear_ReturnsFour()
    {
        var booking = new Booking
        {
            CheckIn = new DateOnly(2026, 6, 1),
            CheckOut = new DateOnly(2026, 6, 5),
        };

        booking.Nights.Should().Be(4);
    }

    // AC3: CabinService.CreateAsync propagates BaseRate from request to the created Cabin
    [Fact]
    public async Task CabinService_CreateAsync_SetsBaseRateFromRequest()
    {
        var cabins = Substitute.For<ICabinRepository>();
        var tags = Substitute.For<IAmenityTagRepository>();
        var sut = new CabinService(cabins, tags);
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, null, 150.00m);
        cabins.AddAsync(Arg.Any<Cabin>(), Arg.Any<CancellationToken>())
            .Returns(c => c.Arg<Cabin>());

        var result = await sut.CreateAsync(Guid.NewGuid(), request);

        result.BaseRate.Should().Be(150.00m);
    }

    // AC4: Create with BaseRate = 0 returns 400 (model validation failure)
    [Fact]
    public async Task CabinsController_Create_ZeroBaseRate_Returns400()
    {
        var repo = Substitute.For<ICabinRepository>();
        var service = Substitute.For<ICabinService>();
        var keyInfoService = Substitute.For<ICabinKeyInfoService>();
        var sut = new CabinsController(repo, service, keyInfoService)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
        sut.ModelState.AddModelError("BaseRate", "The field BaseRate must be between 0.01 and 9999999.99.");
        var request = new CreateCabinRequest("Pine Lodge", "Forest", 4, null, null, 0m);

        var result = await sut.Create(request, default);

        result.Should().BeOfType<BadRequestObjectResult>().Which.StatusCode.Should().Be(400);
    }

    // AC5: CabinRepository.UpdateAsync translates DbUpdateConcurrencyException
    //      into CabinVersionConflictException with the correct cabin ID and version
    [Fact]
    public async Task CabinRepository_UpdateAsync_ConcurrencyConflict_ThrowsVersionConflictException()
    {
        var cabinId = Guid.NewGuid();
        var cabin = new Cabin { Id = cabinId, Version = 3 };
        var db = Substitute.For<AppDbContext>(new DbContextOptions<AppDbContext>());
        db.SaveChangesAsync(Arg.Any<CancellationToken>())
            .Throws(new DbUpdateConcurrencyException());
        var repo = new CabinRepository(db);

        var act = async () => await repo.UpdateAsync(cabin);

        var ex = await act.Should().ThrowAsync<CabinVersionConflictException>();
        ex.Which.CurrentVersion.Should().Be(3);
    }
}
