# Improvement: Supabase Connection String Setup

**Date:** 2026-06-16
**Triggered by:** [Retro — Bolt 01](../retros/2026-06-16-bolt-01-cabin-profile-registration.md)
**Rule file updated:** [guidelines/dev-setup.md](../../../guidelines/dev-setup.md)

---

## Problem

Three separate connection issues consumed significant debugging time during Bolt 01:

1. **URL-format connection strings break when the password contains `@`.** The Supabase dashboard offers `postgresql://user:pass@host/db` as the default copy. Npgsql parses this by splitting on the first `@` — if the password itself contains `@`, the hostname is truncated and the connection silently fails with a confusing DNS error.

2. **New Supabase projects expose the direct host (`db.<project>.supabase.co`) on IPv6 only.** Machines without IPv6 connectivity (or with IPv4-only DNS) receive `WSANO_DATA` (DNS name valid, no A record). The fix is to use the **session-mode pooler** (`aws-<region>.pooler.supabase.com`), which has IPv4 A records. This is not obvious from the Supabase dashboard's default connection string.

3. **Fixing `bin/appsettings.Development.json` directly does not survive a rebuild.** The MSBuild `CopyToOutputDirectory` step overwrites the `bin/` copy from the source project file on every build. The source file at `src/CabinConnect.Api/appsettings.Development.json` must be updated. Additionally, any running API process must be stopped before rebuilding — otherwise the file lock prevents the build from completing.

---

## Rule Changes Applied

### `guidelines/dev-setup.md` — Section 1 (Backend) updated

- Replaced `ConnectionStrings.Default` key name with the actual key (`ConnectionStrings.CabinConnectDb`).
- Documented the Npgsql **key-value format** as the only supported format — URL format is explicitly prohibited.
- Added Supabase pooler hostname guidance with the correct username format (`postgres.<project-ref>`).
- Added `Ssl Mode=Require` requirement.
- Added a warning to stop any running API process before rebuilding.
- Corrected paths and port to match the actual project layout (`src/CabinConnect.Api`, port `5232`).
