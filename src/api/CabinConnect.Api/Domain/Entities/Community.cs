namespace CabinConnect.Api.Domain.Entities;

public sealed class Community
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Region { get; private set; } = string.Empty;
}
