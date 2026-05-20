# Runbook: Rotate Supabase service-role key

**Time budget:** ≤ 30 minutes per environment
**Owner:** FDE / Tech Lead
**Last reviewed:** 2026-05-19
**Delivered by:** U-T06

---

## When to run

| Trigger | Severity | Cadence |
|---|---|---|
| Suspected leak of any environment's service-role key | **Immediate — P0** | As soon as suspected |
| Routine rotation | Standard | Every 90 days |
| Departure of someone with access | Standard | Within 7 days of departure |
| Pre-launch (one-time) | Standard | Before first production traffic |

If a leak is **confirmed** (not suspected), rotate **all three environments** in parallel — assume the leak is wider than evidence suggests.

---

## Pre-flight checklist

- [ ] You have Supabase organization admin access for the affected environment
- [ ] You have GitHub repo admin access (to update Environment Secrets)
- [ ] The next scheduled deployment to the affected environment is paused or you have explicit authorization to deploy during rotation
- [ ] You have a clear 30-minute window without interruptions
- [ ] You have read the *Rollback* section at the bottom of this runbook **before** starting

---

## Steps

### 1. Generate the new key (3 min)

1. Open the affected Supabase project in the Supabase dashboard: `cabinconnect-<env>`
2. Navigate to **Project Settings → API → Service role secret**
3. Click **Reveal new key** to generate a replacement (Supabase keeps the old one valid until you actively revoke it)
4. Copy the new key to your password manager (temporary location — delete after step 5 verification)

### 2. Update GitHub Environment Secret (5 min)

1. In the CabinConnect GitHub repo, go to **Settings → Environments → `<env>`**
2. Find the secret named `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Update value** and paste the new key
4. Click **Update secret** to save

> The frontend-safe `SUPABASE_ANON_KEY` does **not** rotate via this runbook — it is public by design and only changes when the project is recreated.

### 3. Trigger a deployment with the new key (10 min)

1. Open GitHub Actions in the repo
2. Run the `deploy-<env>` workflow via **Run workflow** (manual dispatch)
3. Wait for the deploy to complete (~5–8 min)
4. The deploy must succeed end-to-end. If it fails, **stop and proceed to Rollback** below.

### 4. Verify post-rotation (5 min)

- [ ] The deployed API responds to a smoke-test endpoint (`GET /health`) with 200
- [ ] An authenticated request to a Community-scoped endpoint succeeds (e.g. `GET /communities/me`)
- [ ] Supabase project's **Logs** dashboard shows no spike in 401 / 403 in the last 5 minutes
- [ ] The Sentry / error tracker shows no new errors tagged `auth.supabase.*`

### 5. Revoke the old key (2 min)

1. Back in **Project Settings → API**
2. Click **Revoke previous service role key**
3. Confirm revocation
4. Delete the temporary copy of the new key from your password manager *(it lives in GitHub Secrets now; do not keep duplicates)*

### 6. Log the rotation (3 min)

Append a line to `ai-dlc/ops/operate/incidents/rotation-log.md`:

```
2026-MM-DD · <env> · <FDE name> · routine | leak | departure | pre-launch
```

If this rotation was triggered by an **actual leak**, also open an Incident file in `ai-dlc/ops/operate/incidents/`.

---

## Post-flight verification

- [ ] All 6 steps completed
- [ ] Step 4 verification all green
- [ ] No new errors in Sentry / error tracker for at least 10 minutes after the deploy
- [ ] Rotation logged

---

## Rollback (if any step fails)

If step 3 deploy fails, or step 4 verification fails:

1. **Do not panic** — the old key has not been revoked yet (revocation is step 5)
2. In **GitHub Environment Secrets**, restore the previous value of `SUPABASE_SERVICE_ROLE_KEY` from your password manager (the temporary copy you saved in step 1)
3. Re-run the deploy workflow with the restored key
4. Verify the API is back to a healthy state (step 4 verification)
5. Open an incident file describing what failed
6. Do not retry rotation until the failure mode is understood

If you have **already revoked the old key (step 5) before discovering the failure**, the rotation is committed — you must re-execute steps 1–4 with another new key from scratch. Do not attempt to "revive" the revoked key — Supabase will not honor it.

---

## Time budget — actual measurement

| Run | Env | Date | Actual elapsed | Triggered by |
|---|---|---|---|---|
| <!-- first measurement goes here --> | | | | |

If the actual elapsed time exceeds 30 minutes on any run, file a Bolt 0 (or current Bolt) retro item — the runbook needs refinement.
