# Improvement: Scaffold the secret store before any local config

**Status:** Applied
**Triggered by:** [retros/2026-06-08-bolt-cabin-profile-mvp.md](../retros/2026-06-08-bolt-cabin-profile-mvp.md) — finding "Secrets briefly landed in `appsettings.Development.json`"
**Applied date:** 2026-06-08

---

## Target File

`ai-dlc/setup-guide.md`

---

## Current Text

```
Once all nine questions are answered, the agent has enough to:
- Create the folder structure (Step 1)
- Write the master rule file with Sections 1–5, Section 8, and Process Configuration fully populated
- Write an initial first intent file from the answer to question 8
- Flag Sections 6 and 7 (workflow and review) as pre-populated from the guide defaults

---

## Step 1 — Create the Folder Structure
```

---

## Proposed Replacement

A new "Step 0 — Scaffold the Secret Store Before Any Local Config" section is inserted between the structured-interview output paragraph and Step 1. The section instructs the AI to:

1. Look up the right secret store for the chosen backend stack from a table (.NET → user-secrets, Node → `.env.local`, Python → `.env`, etc.).
2. Verify `.gitignore` covers the secret file **before** the file exists.
3. Run the init command (or create the gitignored file with placeholder keys only — never real values).
4. Add empty placeholders to any tracked config file the framework expects to exist.
5. Document the key-to-store mapping in `guidelines/dev-setup.md`.
6. State the rule explicitly to the engineer: from this point on, any real secret goes into the secret store, never into a tracked file — even temporarily.
7. Record the step as complete before any other scaffolding command runs.

The section also defines the response if a real-looking secret ever appears in a tracked file later: stop, move it to the secret store, replace the tracked-file occurrence with a placeholder, and instruct the engineer to rotate the secret.

See [setup-guide.md](../../../setup-guide.md) for the full inserted text.

---

## Reason

In the cabin-profile-mvp bolt, real Supabase keys briefly landed in `src/api/CabinConnect.Api/appsettings.Development.json` because the AI was asked for a connection string and pasted the engineer's value into the most obvious tracked config file before user-secrets had been initialised. The file was never committed, but the only thing standing between this and a leak was a manual review.

The retro identified the root cause as ordering: the secret store has to exist *before* the AI is in a position to receive a real value. Adding this step to the setup guide makes the correct ordering automatic for every future fresh project, and the explicit "I will refuse to write a real secret into a tracked file" prompt gives the AI a script to push back when an engineer asks for a temporary shortcut.

This change also closes a gap in `code-standards.md` and `security.md`, which both prohibit committing secrets but neither describe how to set things up so the prohibition cannot be accidentally violated during scaffolding.

---

## Validation

- [ ] The next fresh-project bolt run by AI-DLC scaffolds user-secrets / `.env.local` before any tracked config file is touched
- [ ] No tracked config file in any future bolt contains a real secret at any point during the bolt
- [ ] The mapping table in `guidelines/dev-setup.md` exists and lists every key in use
- [ ] The failure mode that triggered this improvement has not recurred after 3 bolts
