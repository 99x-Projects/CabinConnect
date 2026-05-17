using CabinConnect.Api.Infrastructure;
using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Exceptions;
using CabinConnect.Domain.Interfaces;

namespace CabinConnect.Api.Services;

public class InvitationService(IUserRoleRepository userRoles, ISupabaseAdminClient supabase) : IInvitationService
{
    public async Task InviteAsync(string email, string role, CancellationToken ct = default)
    {
        if (await userRoles.ExistsActiveByEmailAsync(email, ct))
            throw new UserAlreadyExistsException(email);

        if (await userRoles.GetPendingByEmailAsync(email, ct) is not null)
            throw new PendingInvitationExistsException(email);

        var supabaseUserId = await supabase.InviteUserAsync(email, ct);

        await userRoles.AddAsync(new UserRole
        {
            Id = Guid.NewGuid(),
            UserId = supabaseUserId,
            Email = email,
            Role = role,
            Status = "pending",
            InvitedAt = DateTimeOffset.UtcNow,
        }, ct);

        await userRoles.SaveAsync(ct);
    }

    public async Task ResendAsync(string email, CancellationToken ct = default)
    {
        var existing = await userRoles.GetPendingByEmailAsync(email, ct)
            ?? throw new InvitationNotFoundException(email);

        await supabase.InviteUserAsync(email, ct);

        existing.InvitedAt = DateTimeOffset.UtcNow;
        await userRoles.SaveAsync(ct);
    }

    public async Task CancelAsync(string email, CancellationToken ct = default)
    {
        var existing = await userRoles.GetPendingByEmailAsync(email, ct)
            ?? throw new InvitationNotFoundException(email);

        await supabase.DeleteUserAsync(existing.UserId, ct);
        await userRoles.RemoveAsync(existing, ct);
        await userRoles.SaveAsync(ct);
    }
}
