using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace CabinConnect.Tests;

public class AmenityTagsControllerTests
{
    private readonly IAmenityTagRepository _repo = Substitute.For<IAmenityTagRepository>();
    private readonly AmenityTagsController _sut;

    public AmenityTagsControllerTests() => _sut = new AmenityTagsController(_repo);

    // AC1: returns all tags with id and name
    [Fact]
    public async Task GetAll_WhenTagsExist_ReturnsOkWithAllTags()
    {
        var tags = new List<AmenityTag>
        {
            new() { Id = Guid.NewGuid(), Name = "Heater" },
            new() { Id = Guid.NewGuid(), Name = "WiFi" }
        };
        _repo.GetAllOrderedByNameAsync(Arg.Any<CancellationToken>()).Returns(tags);

        var result = await _sut.GetAll(default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dtos = (result.Value as IEnumerable<AmenityTagDto>)!.ToList();
        dtos.Should().HaveCount(2);
        dtos.Should().AllSatisfy(d => d.Id.Should().NotBeEmpty());
        dtos.Select(d => d.Name).Should().BeEquivalentTo(["Heater", "WiFi"]);
    }

    // AC2: ordering is delegated to the repository method that promises alphabetical order
    [Fact]
    public async Task GetAll_DelegatesOrderingToRepository()
    {
        _repo.GetAllOrderedByNameAsync(Arg.Any<CancellationToken>()).Returns([]);

        await _sut.GetAll(default);

        await _repo.Received(1).GetAllOrderedByNameAsync(Arg.Any<CancellationToken>());
    }

    // AC3: empty tag table returns HTTP 200 with empty array
    [Fact]
    public async Task GetAll_WhenNoTagsExist_ReturnsOkWithEmptyArray()
    {
        _repo.GetAllOrderedByNameAsync(Arg.Any<CancellationToken>()).Returns([]);

        var result = await _sut.GetAll(default) as OkObjectResult;

        result!.StatusCode.Should().Be(200);
        var dtos = (result.Value as IEnumerable<AmenityTagDto>)!;
        dtos.Should().BeEmpty();
    }
}
