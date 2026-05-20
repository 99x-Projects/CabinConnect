# Unit: U-007 — PWA shell + service worker scaffold

**Owning Intent:** [CI-13 Offline-First Caching for Critical Reads](../../inception/intents/2026-05-19-offline-caching.md)
**Status:** Done — 2026-05-20 (mock-quality — installable PWA, manifest, service worker auto-update; offline read cache itself is U-008 in Bolt 3)
**Bolt:** Bolt 1 — UI Foundation *(re-scoped 2026-05-20 from earlier Foundation Bolt framing)*
**Dependencies:** U-T01
**Prompt log:** [2026-05-20-bolt-01-ui-finishing.md](../../../prompts/2026-05-20-bolt-01-ui-finishing.md)
**Files delivered:** `platform/frontend/public/manifest.webmanifest`, `platform/frontend/vite.config.ts` updated with `vite-plugin-pwa`, `platform/frontend/package.json` dep added

---

## Context

Make the React app installable as a Progressive Web App. Register a service worker. Precache the app shell so the user always loads *something* offline — not a generic browser error. Provide a non-blocking "new version available" prompt for service worker updates.

## Acceptance Criteria

- Given a user visits CabinConnect on a supported browser meeting PWA install criteria, when they navigate to the install action (Add to Home Screen on iOS, install icon on Android Chrome), then the PWA installs.
- Given a user opens the installed PWA from the home screen, when launched, then it runs in standalone mode (no browser chrome).
- Given the app loads with network, when the page finishes loading, then the service worker is registered and active.
- Given the user is offline and opens the installed PWA, when launched, then the app shell loads (HTML/CSS/JS) and the user sees an "offline" indicator in the chrome, not a browser error page.
- Given the service worker receives an update on a subsequent visit, when the update is detected, then the user is shown a non-blocking "new version available — reload" prompt.
- Given a critical fix is released, when the developer toggles the `force-skip-waiting` config flag, then existing clients update without waiting for natural lifecycle.

## Scope

**In scope:**
- PWA manifest (icons, theme color, name, `display=standalone`, locale-aware name fields)
- Service worker registration in React app
- Static asset precaching for the app shell
- Offline-page fallback for shell rendering
- Service worker update lifecycle prompt
- `force-skip-waiting` config flag

**Out of scope:**
- Critical-read caching strategy and the `X-Cabin-Cache-Profile` header contract (U-008)
- Push notification support (later module Intents)
- Background sync

## Definition of Done

- [ ] AC covered by tests (Lighthouse PWA audit in CI + Playwright offline test)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
