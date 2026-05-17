namespace CabinConnect.Domain.Entities;

public class UserRole
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTimeOffset InvitedAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
}
