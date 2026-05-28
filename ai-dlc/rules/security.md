# Security Rules

## Never Do These
- Never commit secrets, API keys, or connection strings — use environment variables or a secrets manager
- Never trust client-supplied IDs without verifying ownership server-side
- Never expose internal stack traces or error details to the client
- Never use raw string concatenation to build SQL queries
- Never disable CSRF protection or CORS wildcard (`*`) in production
- Never store passwords in plain text or with weak hashing (MD5/SHA1)
- Never log personally identifiable information (PII) or sensitive user data
- Never allow unrestricted file uploads — validate type, size, and scan for malware

## Always Do These
- Validate and sanitize all input at the API boundary
- Enforce row-level security (RLS) on all Supabase tables
- Use parameterized queries / ORM for all database interactions
- Authenticate every API endpoint — no unauthenticated routes unless explicitly public
- Apply the principle of least privilege to database roles and service accounts
- Use HTTPS everywhere; reject HTTP in production
- Rate-limit authentication endpoints to prevent brute-force attacks

## Secret-Leak Protocol — Rotate First, Finish Work Later
If a credential (DB password, API key, JWT signing key, service-role key, OAuth client secret, etc.) appears in **any** of the following surfaces, treat the credential as compromised and rotate it BEFORE continuing other work:

- AI chat (Copilot, Claude, ChatGPT) — the transcript is retained
- A pull request description, comment, or review
- A committed file in any branch (even if reverted — `git log -p` keeps it)
- A screenshot, screen recording, or video shared in chat / tickets
- A log file, error message, or stack trace that was shared outside the box that produced it
- A support ticket, email, or external messaging app

Order of operations (no exceptions):
1. **Rotate** the credential in the source system (Supabase dashboard, cloud provider IAM, etc.).
2. **Update** every local copy (gitignored `appsettings.Local.json`, `.env.local`, user-secrets, CI secret store).
3. **Verify** the old credential no longer works (one quick failed connection attempt).
4. **Then** resume whatever work was interrupted.

Do not skip rotation because "the chat is private" or "the screenshot was only sent to one person". Treat retention and propagation as out of your control once a secret leaves your machine.

## Supabase-Specific
- Enable RLS on every table before going to production
- Use Supabase Auth for all user identity — do not roll your own auth
- Service role key must never be used client-side
- Anon key is safe for the client only when RLS policies are correct

## Dependency Management
- Run `npm audit` and `dotnet list package --vulnerable` in CI
- Pin major versions; review breaking changes before upgrading
- Remove unused packages promptly
