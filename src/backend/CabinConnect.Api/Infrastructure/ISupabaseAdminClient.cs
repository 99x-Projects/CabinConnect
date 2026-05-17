namespace CabinConnect.Api.Infrastructure;

public interface ISupabaseAdminClient
{
    Task<Guid> InviteUserAsync(string email, CancellationToken ct = default);
    Task DeleteUserAsync(Guid userId, CancellationToken ct = default);
}
