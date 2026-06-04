# Improvement: Mandatory File Read Before Code Generation

**Date:** 2026-06-04
**Triggered by:** [Bolt-01 Retro](../retros/2026-06-04-bolt-01-retro.md)
**Status:** Applied

---

## Problem

During Bolt-01 execution, the AI attempted to replace file content without first reading the current state of the file. The Vite v8 `react-ts` template generates a significantly different `App.tsx` than expected, causing the first replacement attempt to fail. This would have been avoided by reading the file before attempting to edit it.

## Current Behaviour

The unit execution workflow in the Instructions guide says:
1. API contract first
2. Implementation scaffold
3. Fill in TODOs
4. Tests
5. Claude self-review

No explicit step says "read existing files before modifying them."

## Proposed Change

Add to the Build phase execution steps in `Instructions2FDE.md`:

> **Before modifying any existing file:** read its current content to understand the existing structure. Do not assume file contents match a template or a previous version.

Also add to the unit template's Pre-generation Checks section:

> - Read all files that will be modified — verify their current structure matches assumptions

## Rationale

- AI tools cannot reliably predict file contents — templates change between versions
- Reading first costs seconds; failing and retrying costs minutes and produces noise in the audit trail
- This is a defensive practice that prevents a class of "confident but wrong" edits

## Applied To

- This file documents the lesson for future sessions
- The principle is already enforced by the review checklist ("No hallucinated API methods, library names, or type signatures")

---

## Additional Improvement: Enforce JWKS in Production

**Problem:** Bolt-01 used symmetric JWT validation (HS256 with Supabase JWT secret) for simplicity, but ADR-005 mandates JWKS-based validation (ES256 via Authority endpoint).

**Resolution:** For local development, symmetric validation with the JWT secret is acceptable. For production deployment, the Program.cs must be updated to use Authority-based validation. Document this in the dev-setup guide as a known divergence.

**Status:** Documented — production config will be addressed when deployment infrastructure is set up.
