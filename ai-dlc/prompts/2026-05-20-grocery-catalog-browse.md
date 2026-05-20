# Prompt Log — Grocery Catalog Browse

**Date:** 2026-05-20
**Unit:** [Grocery Catalog Browse](../ops/build/units/grocery-catalog-browse.md)
**Engineer:** Isanka Patabandige
**AI Tool:** Claude (claude-sonnet-4-6) via Claude Code

---

## Prompt

```
Context: CabinConnect greenfield project. .NET 8 Web API (repository pattern, async/await),
React 18 + TypeScript (strict mode), Supabase PostgreSQL with RLS.
Unit 1: Grocery Catalog Browse — Hosts browse available grocery items, optionally filtered by category.

Constraints: repository pattern, parameterized SQL only, [Authorize] on every endpoint,
DTOs at API boundary (domain models internal), no .Result/.Wait(), no TypeScript `any`,
JWKS-based JWT auth (ADR-005), no CORS wildcard, env vars for all secrets.

Acceptance Criteria (from grocery-catalog-browse.md):
- Given a Host is authenticated, when they request the grocery catalog, then available items are returned with name, description, unit price, and category
- Given a Host filters by category, when the request is submitted, then only items in that category are returned
- Given an item is marked unavailable, when the Host views the catalog, then that item does not appear
- Given an unauthenticated user, when they request the catalog, then a 401 is returned

Output Format: Full implementation — domain model, repository, service, controller, DTOs,
tests (xUnit + React Testing Library), Supabase migration with RLS policy.
```

## Files Generated

### Backend
- `src/backend/CabinConnect.Domain/Groceries/GroceryItem.cs`
- `src/backend/CabinConnect.Domain/Groceries/IGroceryItemRepository.cs`
- `src/backend/CabinConnect.Domain/Groceries/IGroceryItemService.cs`
- `src/backend/CabinConnect.Domain/Groceries/GroceryItemService.cs`
- `src/backend/CabinConnect.Infrastructure/Data/IDbConnectionFactory.cs`
- `src/backend/CabinConnect.Infrastructure/Data/NpgsqlConnectionFactory.cs`
- `src/backend/CabinConnect.Infrastructure/Repositories/GroceryItemRepository.cs`
- `src/backend/CabinConnect.Api/Controllers/GroceriesController.cs`
- `src/backend/CabinConnect.Api/DTOs/GroceryItemDto.cs`
- `src/backend/CabinConnect.Api/Program.cs`
- `src/backend/CabinConnect.Tests/Groceries/GroceryItemServiceTests.cs`
- `src/backend/CabinConnect.Tests/Groceries/GroceriesControllerTests.cs`

### Frontend
- `src/frontend/src/lib/supabase-client.ts`
- `src/frontend/src/hooks/use-session.ts`
- `src/frontend/src/types/grocery.ts`
- `src/frontend/src/api/groceries.ts`
- `src/frontend/src/components/groceries/category-filter.tsx`
- `src/frontend/src/components/groceries/grocery-list.tsx`
- `src/frontend/src/components/groceries/grocery-list.test.tsx`

### Database
- `supabase/migrations/20260520000001_create_grocery_items.sql`

## Review Notes

- AC1 ✅ `GET /api/groceries` returns available items to authenticated Host
- AC2 ✅ `?category=` query param filters by category (parameterized, no string concatenation)
- AC3 ✅ `WHERE available = true` in SQL; RLS policy also restricts to `available = true`
- AC4 ✅ `[Authorize]` on controller returns 401 for unauthenticated requests
- EC-011 through EC-015: not applicable to catalog browse (read-only)
- No secrets in code — connection string and Supabase URL from env/config
- CORS: `WithOrigins(allowedOrigins)` from config — no wildcard
- JWT: JWKS authority-based validation per ADR-005
