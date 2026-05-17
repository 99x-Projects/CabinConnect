using CabinConnect.Domain.Entities;

namespace CabinConnect.Domain.Interfaces;

public interface IUserRoleRepository
{
    Task<UserRole?> GetPendingByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsActiveByEmailAsync(string email, CancellationToken ct = default);
    Task AddAsync(UserRole userRole, CancellationToken ct = default);
    Task RemoveAsync(UserRole userRole, CancellationToken ct = default);
    Task SaveAsync(CancellationToken ct = default);
}
