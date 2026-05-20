using CabinConnect.Api.Controllers;
using CabinConnect.Api.DTOs;
using CabinConnect.Domain.Groceries;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace CabinConnect.Tests.Groceries;

public sealed class GroceriesControllerTests
{
    private readonly Mock<IGroceryItemService> _serviceMock = new();
    private readonly GroceriesController _sut;

    public GroceriesControllerTests()
    {
        _sut = new GroceriesController(_serviceMock.Object);
    }

    [Fact]
    public async Task GetCatalog_Returns200_WithItemDtos()
    {
        var items = new List<GroceryItem>
        {
            new(Guid.NewGuid(), "Milk", null, 2.50m, "Dairy", "litre"),
        };
        _serviceMock
            .Setup(s => s.GetCatalogAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var result = await _sut.GetCatalog(null, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }

    [Fact]
    public async Task GetCatalog_ResponseContainsDataAndNullError()
    {
        var items = new List<GroceryItem>
        {
            new(Guid.NewGuid(), "Milk", null, 2.50m, "Dairy", "litre"),
        };
        _serviceMock
            .Setup(s => s.GetCatalogAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var result = await _sut.GetCatalog(null, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var body = ok.Value!;
        var dataProperty = body.GetType().GetProperty("data");
        var errorProperty = body.GetType().GetProperty("error");
        Assert.NotNull(dataProperty);
        Assert.Null(errorProperty!.GetValue(body));
    }

    [Fact]
    public async Task GetCatalog_PassesCategoryToService()
    {
        _serviceMock
            .Setup(s => s.GetCatalogAsync("Dairy", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GroceryItem>());

        await _sut.GetCatalog("Dairy", CancellationToken.None);

        _serviceMock.Verify(s => s.GetCatalogAsync("Dairy", It.IsAny<CancellationToken>()), Times.Once);
    }
}
