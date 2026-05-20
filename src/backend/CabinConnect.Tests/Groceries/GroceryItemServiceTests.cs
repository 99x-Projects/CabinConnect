using CabinConnect.Domain.Groceries;
using Moq;

namespace CabinConnect.Tests.Groceries;

public sealed class GroceryItemServiceTests
{
    private readonly Mock<IGroceryItemRepository> _repositoryMock = new();
    private readonly GroceryItemService _sut;

    public GroceryItemServiceTests()
    {
        _sut = new GroceryItemService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetCatalogAsync_ReturnsAllAvailableItems_WhenNoCategoryFilter()
    {
        var items = new List<GroceryItem>
        {
            new(Guid.NewGuid(), "Milk", null, 2.50m, "Dairy", "litre"),
            new(Guid.NewGuid(), "Bread", "Sourdough", 4.00m, "Bakery", "each"),
        };
        _repositoryMock
            .Setup(r => r.GetAvailableAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var result = await _sut.GetCatalogAsync(null, CancellationToken.None);

        Assert.Equal(2, result.Count);
        _repositoryMock.Verify(r => r.GetAvailableAsync(null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCatalogAsync_PassesCategoryFilterToRepository()
    {
        _repositoryMock
            .Setup(r => r.GetAvailableAsync("Dairy", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GroceryItem>
            {
                new(Guid.NewGuid(), "Milk", null, 2.50m, "Dairy", "litre"),
            });

        var result = await _sut.GetCatalogAsync("Dairy", CancellationToken.None);

        Assert.Single(result);
        _repositoryMock.Verify(r => r.GetAvailableAsync("Dairy", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCatalogAsync_ReturnsEmpty_WhenNoItemsExist()
    {
        _repositoryMock
            .Setup(r => r.GetAvailableAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<GroceryItem>());

        var result = await _sut.GetCatalogAsync(null, CancellationToken.None);

        Assert.Empty(result);
    }
}
