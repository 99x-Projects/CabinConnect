# Improvement: Secret leak protocol — rotate first, finish work later

**Date:** 2026-05-28
**Triggered By:** [Retro — Bolt repo-scaffold](../retros/repo-scaffold.md)
**Target File:** [ai-dlc/rules/security.md](../../../rules/security.md)
**Status:** Applied

---

## What to Change

Promote the existing one-liner "Rotate secrets immediately if accidentally exposed" into a dedicated, fully-specified protocol block. The current line is easy to skim past; the new block names every realistic leak vector (chat, PR, commit, screenshot, log, ticket, email) and makes the order of operations explicit (**rotate first**, then continue work).

### Current

```
## Always Do These
- Validate and sanitize all input at the API boundary
- Enforce row-level security (RLS) on all Supabase tables
- Use parameterized queries / ORM for all database interactions
- Authenticate every API endpoint — no unauthenticated routes unless explicitly public
- Apply the principle of least privilege to database roles and service accounts
- Use HTTPS everywhere; reject HTTP in production
- Rate-limit authentication endpoints to prevent brute-force attacks
- Rotate secrets immediately if accidentally exposed
```

### Proposed

```
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
```

## Why

During `repo-scaffold` Wave 2, a live Supabase DB password was pasted into AI chat as part of a connection-string template. The existing one-liner ("Rotate secrets immediately if accidentally exposed") is technically correct but easy to skim past, and the trigger ("exposed") is vague enough that an engineer might rationalise away a chat-only paste. The replacement enumerates the surfaces explicitly and locks down the order of operations so there's no ambiguity.

## Expected Outcome

- Engineers (and AI agents) have an unambiguous rule to point at the moment a secret appears in chat / a PR / a screenshot.
- The default response to a leak is rotation, not negotiation.
- Reviewers can cite this section verbatim when blocking a PR that contains a credential.

## Applied

- [x] Target file updated ([ai-dlc/rules/security.md](../../../rules/security.md))
- [x] Retro updated to mark this improvement as applied ([retros/repo-scaffold.md](../retros/repo-scaffold.md))
- [ ] Team notified — n/a (single-operator project at this time)
