# Security Rules

---

## Never Do These

| Rule | Detail |
|---|---|
| Never commit secrets, API keys, or connection strings | Use environment variables or a secrets vault. The Supabase service role key and JWT secret must never appear in source code or config files checked into git. |
| Never trust client-supplied IDs without server-side verification | Always load the resource from the database and verify ownership (`entity.HostId == hostId`) before acting on it. |
| Never expose internal stack traces or error detail to the client | Return generic error messages to the client; log detail server-side. |
| Never use raw SQL string concatenation | Use EF Core LINQ queries or parameterized raw SQL only (`FromSqlRaw` with parameters). |
| Never call Supabase directly from the React frontend for data mutations | The React app calls the .NET API; the .NET API handles all database writes. |
| Never disable CORS wildcard (`*`) in production | Configure explicit allowed origins; wildcard is for development only. |
| Never switch authentication from JWT Bearer to cookies without adding CSRF protection | Current JWT Bearer pattern is CSRF-safe; cookie-based auth is not. |
| Never expose the Supabase service role key to the frontend | It is an admin key with full database access. It lives only in backend configuration. |
| Never render user-provided content with `dangerouslySetInnerHTML` | All user-provided strings must be treated as untrusted text. |
| Never log sensitive field values (access codes, emergency contacts) | Audit log only the reveal event — who accessed what cabin, when — not the plaintext values. |

---

## Always Do These

| Rule | Detail |
|---|---|
| Validate and sanitize all input at the API boundary | Use Data Annotations (`[Required]`, `[MaxLength]`, `[EmailAddress]`) on all request DTOs. Check `ModelState.IsValid` in every controller. |
| Authenticate every endpoint | All controllers must carry `[Authorize]`. Explicitly mark public endpoints with `[AllowAnonymous]` and document why. |
| Verify resource ownership at the controller level | Extract `sub` claim as `hostId`, load the resource, compare `resource.HostId == hostId` before delegating to the service. Return 403 if mismatch. |
| Enable RLS on every Supabase table | Deny-all by default; add explicit allow policies. When adding new tables, define and test RLS policies before merging. |
| Store the Supabase service role key in a secrets vault | Not in `appsettings.json`, not in `.env` files checked into git. Use environment variables injected at runtime. |
| Add `[MaxLength]` to all string fields on request DTOs | Prevents DoS via oversized payloads and controls database storage. |
| Use HTTPS for all external communication | No plain HTTP calls to Supabase or any external service. |
| Inject the Bearer token on every API request from the frontend | The `apiFetch()` wrapper handles this — never skip it by calling `fetch()` directly. |
| Log all privileged operations | Invitation, user deletion, and key info reveal must be logged with actor ID, timestamp, and target resource. |
| Rotate the Supabase service role key on a documented schedule | Record the last rotation date in a secure internal document (not in this repo). |

---

## Supabase-Specific Rules

- **RLS is the last line of defence** — the .NET API must also enforce ownership. Both layers must agree.
- **JWT validation:** Configure `OnTokenValidated` to extract `app_metadata.role` as a claim. Do not read `app_metadata` JSON inline in controllers — use the extracted claim.
- **Super admin check:** Use `User.HasClaim(AuthConstants.AppRoleClaimName, AuthConstants.SuperAdminRole)` only. Do not re-parse `app_metadata` in controllers.
- **`anon` key vs `service_role` key:** The frontend uses the `anon` key (safe to expose). The backend uses the `service_role` key (must be secret). Never swap them.

---

## JWT-Specific Rules

- Validate tokens via the Supabase JWKS endpoint (`{supabaseUrl}/auth/v1/.well-known/jwks.json`)
- Tolerate a 30-second clock skew (`ClockSkew = TimeSpan.FromSeconds(30)`)
- Do not validate audience or issuer if Supabase is the sole provider (lenient mode). If multiple providers are added, re-enable these checks.
- On 401 from the API, the frontend must call `supabase.auth.signOut()` (awaited) before redirecting to `/login`

---

## Feature Flag Security Note

Environment variable feature flags (`VITE_FF_*`) are visible in the browser bundle. Do not use them to gate security-sensitive behaviour — they are for UX and rollout control only. Security checks must live in the API regardless of flag state.
