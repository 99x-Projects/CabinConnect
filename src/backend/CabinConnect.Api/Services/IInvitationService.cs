namespace CabinConnect.Api.Services;

public interface IInvitationService
{
    Task InviteAsync(string email, string role, CancellationToken ct = default);
    Task ResendAsync(string email, CancellationToken ct = default);
    Task CancelAsync(string email, CancellationToken ct = default);
}
