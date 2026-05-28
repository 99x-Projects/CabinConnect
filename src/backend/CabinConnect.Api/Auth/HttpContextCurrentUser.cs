using System.Security.Claims;
using CabinConnect.Domain.Auth;
using Microsoft.AspNetCore.Http;

namespace CabinConnect.Api.Auth;

/// <summary>
/// Resolves <see cref="ICurrentUser"/> from the validated JWT bearer principal
/// on the current <see cref="HttpContext"/>. Registered as scoped.
/// </summary>
public sealed class HttpContextCurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public HttpContextCurrentUser(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    private ClaimsPrincipal? Principal => _accessor.HttpContext?.User;

    public bool IsAuthenticated =>
        Principal?.Identity?.IsAuthenticated == true && TryParseSub(out _);

    public Guid Id =>
        TryParseSub(out var id)
            ? id
            : throw new InvalidOperationException(
                "ICurrentUser.Id was accessed without an authenticated principal carrying a valid GUID 'sub' claim.");

    private bool TryParseSub(out Guid id)
    {
        id = Guid.Empty;
        var sub = Principal?.FindFirstValue("sub") ?? Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(sub) && Guid.TryParse(sub, out id);
    }
}
