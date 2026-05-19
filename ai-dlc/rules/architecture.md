# Architecture Decisions

## System Overview
CabinConnect is a cabin booking platform. The backend is a .NET Web API, the frontend is a React SPA, and Supabase provides the database (PostgreSQL), auth, and real-time capabilities.

## Decision Log

### ADR-001 — Supabase as the data layer
**Decision:** Use Supabase (managed PostgreSQL) rather than a self-hosted database.
**Why:** Provides auth, real-time subscriptions, and row-level security out of the box, reducing infrastructure burden for an early-stage product.
**Trade-off:** Vendor lock-in on RLS policy syntax and Supabase-specific client SDK patterns.

### ADR-002 — .NET Web API as the backend
**Decision:** Keep a dedicated .NET backend rather than going serverless-first or using Supabase Edge Functions for all logic.
**Why:** Complex booking business logic (availability calculations, payment orchestration) benefits from a strongly-typed, testable server environment.
**Trade-off:** An extra service to deploy and maintain compared to a fully Supabase-driven approach.

### ADR-003 — React SPA (not SSR)
**Decision:** Client-rendered React app, not Next.js or server-rendered.
**Why:** The app is behind authentication; SEO is not a priority. SPA simplifies deployment (static hosting).
**Trade-off:** Slower initial load vs. SSR; revisit if a public-facing marketing page is added.

### ADR-004 — Monorepo structure
**Decision:** Frontend and backend live in the same repository.
**Why:** Easier cross-cutting changes (shared types, coordinated deploys) for a small team.
**Trade-off:** CI pipelines must be scoped carefully to avoid rebuilding everything on every change.

### ADR-005 — Supabase JWT signing algorithm
**Decision:** Use JWKS-based JWT validation in the .NET API (`options.Authority = supabaseUrl + "/auth/v1"`), not symmetric key validation.
**Why:** Supabase Cloud signs JWTs with ES256 (asymmetric ECDSA, P-256), not HS256. The JWKS endpoint (`/auth/v1/.well-known/jwks.json`) is the correct key source. Attempting symmetric validation with the Supabase JWT secret will fail with a signature error even if the kid matches. Authority-based validation also handles key rotation automatically.
**Trade-off:** The API must be able to reach the Supabase JWKS endpoint at startup; air-gapped environments would need to cache the public key manually.

## Boundaries
- The React app communicates with the .NET API only — it does not call Supabase directly for data mutations
- Supabase client is used on the frontend for auth token management and real-time subscriptions only
- All business rules live in the .NET domain layer, not in the database or frontend
