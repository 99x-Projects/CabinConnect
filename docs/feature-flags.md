# Feature flags

CabinConnect uses a minimal env-var-driven feature-flag system. There is **no runtime flag service** (no LaunchDarkly, Unleash, ConfigCat). Flipping a flag requires a redeploy on both stacks.

## Where to register a new flag

A flag MUST be declared in three places before it can be referenced anywhere else:

1. **Backend (`CabinConnect.Api`):** add a `public const string` to [`KnownFeatureFlags`](../src/backend/CabinConnect.Api/FeatureFlags/KnownFeatureFlags.cs) and add it to the internal `All` set. `IFeatureFlags.IsEnabled` throws `ArgumentException` for any name not present here.
2. **Frontend (`src/frontend`):** extend the `FeatureFlagName` union in [`feature-flags.ts`](../src/frontend/src/lib/feature-flags.ts) and add a mapping into `FLAG_ENV_KEYS`. Augment `ImportMetaEnv` in [`vite-env.d.ts`](../src/frontend/src/vite-env.d.ts) with the new `VITE_FF_*` key.
3. **Defaults:** add the key to both `.env.example` files (frontend) and `appsettings.json` (backend, under `FeatureFlags`).

## Override mechanism

| Stack | Override |
|---|---|
| Backend | `appsettings.{Env}.json` → `FeatureFlags:<flag_name>: true` **or** env var `FeatureFlags__<flag_name>=true` (double underscore, lowercase name). |
| Frontend | Vite env var `VITE_FF_<FLAG_NAME>=true`. **Inlined at build time** — flipping in production requires a rebuild + redeploy. |

## Truthy parsing asymmetry (deliberate)

| Stack | Accepts as ON | Rationale |
|---|---|---|
| Backend (.NET) | Anything `bool.Parse` / `ConfigurationBinder` accepts — `"true"`, `"True"`, `"TRUE"`. | Mirrors standard .NET config binding. |
| Frontend (React/Vite) | **Only the exact lowercase string `"true"`** (case-sensitive). | Vite inlines env vars as strings; strict parsing prevents subtle typos (`"True"`, `"1"`, `"yes"`) from silently enabling a flag in prod. |

When in doubt, use lowercase `true` everywhere.

## Why throw on unknown flag names

- Catches typos at first call instead of silently returning `false`.
- Forces the registry update step — every flag is discoverable via `KnownFeatureFlags`.
- Frontend gets the same guarantee at **compile time** via the `FeatureFlagName` union.

## Currently registered flags

| Name | Default | Owner | Notes |
|---|---|---|---|
| `cabin_profile_mvp` | OFF on both stacks | `cabin-profile-mvp` bolt | Gates the cabin/community/owner-signup MVP UI + endpoints. Not yet wired to anything (registered by [`feature-flag-plumbing`](../ai-dlc/ops/build/units/feature-flag-plumbing.md)). |

## Env-var casing across OSes

The configuration section name preserves `lower_snake_case` exactly (`FeatureFlags:cabin_profile_mvp`). On Linux env vars are case-sensitive — use `FeatureFlags__cabin_profile_mvp=true` exactly. On Windows env vars are case-insensitive at lookup but write them lowercase for consistency.

## Removing a flag

1. Delete the const from `KnownFeatureFlags` and any references — backend will throw at runtime if a stale call remains.
2. Remove the value from the `FeatureFlagName` union and `FLAG_ENV_KEYS` — frontend stale calls become **compile errors**.
3. Drop the `VITE_FF_*` and `FeatureFlags:*` entries from defaults and `.env.example`.
