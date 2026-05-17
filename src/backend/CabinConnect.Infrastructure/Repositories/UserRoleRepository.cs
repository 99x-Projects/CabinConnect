using CabinConnect.Domain.Entities;
using CabinConnect.Domain.Interfaces;
using CabinConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Infrastructure.Repositories;

public class UserRoleRepository(AppDbContext db) : IUserRoleRepository
{
    public Task<UserRole?> GetPendingByEmailAsync(string email, CancellationToken ct = default) =>
        db.UserRoles.FirstOrDefaultAsync(u => u.Email == email && u.Status == "pending", ct);

    public Task<bool> ExistsActiveByEmailAsync(string email, CancellationToken ct = default) =>
        db.UserRoles.AnyAsync(u => u.Email == email && u.Status == "active", ct);

    public async Task AddAsync(UserRole userRole, CancellationToken ct = default) =>
        await db.UserRoles.AddAsync(userRole, ct);

    public Task RemoveAsync(UserRole userRole, CancellationToken ct = default)
    {
        db.UserRoles.Remove(userRole);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
