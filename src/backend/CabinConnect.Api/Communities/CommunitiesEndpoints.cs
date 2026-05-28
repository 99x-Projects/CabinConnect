using CabinConnect.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace CabinConnect.Api.Communities;

public static class CommunitiesEndpoints
{
    public static IEndpointRouteBuilder MapCommunitiesEndpoints(this IEndpointRouteBuilder routes)
    {
        // Auth requirement is inherited from the global fallback policy in
        // AuthServiceCollectionExtensions; no explicit RequireAuthorization() needed.
        routes.MapGet("/api/communities", async (CabinConnectDbContext db, CancellationToken ct) =>
            {
                var communities = await db.Communities
                    .OrderBy(c => c.Name)
                    .Select(c => new CommunityDto(c.Id, c.Name, c.Region, c.Active))
                    .ToListAsync(ct);

                return Results.Ok(communities);
            })
            .WithName("ListCommunities")
            .WithOpenApi();

        return routes;
    }
}
