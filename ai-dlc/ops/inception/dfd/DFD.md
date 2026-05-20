# Design Foundation Document — CabinConnect

| Field | Value |
|---|---|
| **Status** | `Draft` |
| **Version** | 0.1 |
| **Owner** | Asitha (FDE — designer role currently unfilled; FDE is stand-in) |
| **Last updated** | 2026-05-19 |
| **Approval mode** | Simulation — items marked `[Simulated designer approval]` are placeholder decisions a real designer would refine |
| **Linked artifacts** | [PRD](../prd/PRD.md) · [TFD](../tfd/TFD.md) · [CLAUDE.md §1](../../../../CLAUDE.md) |

> **Note on quality.** This is a *mock-quality* DFD — substantive enough to show the shape and surface decision points, but the real document needs a working designer. Sections marked `[Simulated designer approval]` are exactly the items that need designer input. Items marked `[FDE-decided]` are decisions the FDE can credibly make solo (technology choices, standards alignment).

---

## 1. Purpose

The DFD is the engineering team's design-system source of truth for CabinConnect. It captures the cross-cutting design decisions that every feature Bolt should inherit — colours, typography, components, accessibility, interaction patterns — so that the first feature does not silently commit the team to ad-hoc choices.

---

## 2. Visual language

The product serves Norwegian cabin owners — long-distance weekend users (P-1, P-2), year-round residents (P-3, P-4). The visual register is **practical, warm, outdoor — Scandinavian-minimal with cabin warmth.** Not corporate. Not playful. Confidently restrained.

### Colour palette *(starter, designer-refinable)*

| Token | Hex (sketch) | Use |
|---|---|---|
| `color/primary` | `#2d5a3d` (pine green) | Primary actions, links, focus |
| `color/primary-fg` | `#f7f5f0` (birch white) | Foreground on primary |
| `color/accent` | `#e07b3c` (firelight) | Sparingly — alerts attention, not decoration |
| `color/surface` | `#f7f5f0` (birch white) | Page background |
| `color/surface-raised` | `#ffffff` | Cards, sheets, modals |
| `color/border` | `#e8e6e0` | Subtle separators |
| `color/text` | `#2a2a2a` (charcoal) | Body |
| `color/text-muted` | `#6c6c6c` | Captions, hints |
| `color/error` | `#b03a2e` | Errors |
| `color/success` | `#2e7d32` | Confirmations |
| `color/warning` | `#d6a012` | Warnings |
| `color/offline` | `#6c6c6c` (muted) | Offline state, last-updated timestamps |

`[Simulated designer approval]` — A real designer should validate contrast ratios, dark mode, and how these read on Norwegian winter screens (low ambient light).

### Typography

- Primary: **Inter Variable** (sans, free, Norwegian-character support, web-optimized)
- Code/data: **JetBrains Mono** (only where typographic monospace matters — IDs, timestamps)
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 (modular, no oddballs)
- Line height: 1.5 for body, 1.2 for headings
- Weight: 400 body, 500 captions, 600 headings, 700 emphasis

[FDE-decided] Inter is the safe default and unblocks the team. Designer may swap to a Norwegian foundry (e.g. **Klim**, **Pangram**) when staffed.

### Spacing scale

8pt grid: `0 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`. `[FDE-decided]`

### Iconography

**Lucide** — React-native, kebab-cased names, MIT, ~1500 icons. Custom icons added per-feature only when Lucide lacks coverage. `[FDE-decided]`

### Shape & elevation

- Border radius: `4px` (subtle), `8px` (cards), `12px` (sheets/modals), `999px` (pills)
- Elevation: flat by default; `shadow/sm` on raised cards; `shadow/md` on hover/active modals. No long shadows. `[Simulated designer approval]`

---

## 3. Component approach

| Area | Decision | Rationale | ADR |
|---|---|---|---|
| Component library | **shadcn/ui** — copy-paste primitives owned by the codebase | No vendor lock-in; team owns every component; customization is the default, not an exception | ADR-D01 |
| Underlying primitives | **Radix UI** | Accessibility built-in; battle-tested; what shadcn/ui ships on | ADR-D01 |
| Styling | **Tailwind CSS v4** | Token-friendly (CSS-vars-first), small runtime, plays well with design tokens | ADR-D01 |
| Animation | **Framer Motion** for non-trivial transitions; CSS for hover/focus | Most UI needs nothing fancier than CSS; Framer for stateful animations only | `[FDE-decided]` |

> The shadcn/ui + Radix + Tailwind trio gives us *primitives we own* plus *accessibility we don't have to reinvent* plus *a styling layer that consumes design tokens directly*. Worth ADR-D01.

---

## 4. Design tokens

| Area | Decision |
|---|---|
| Source of truth | `platform/frontend/src/design-tokens/*.json` (in-repo JSON) at MVP |
| Consumers | Tailwind config + CSS custom properties on `:root` |
| Figma | Reference and visualization tool, NOT source of truth at MVP. Designer's working file lives there; tokens are exported via Style Dictionary or hand-mirrored at the early stage |
| When Figma becomes source | Phase 2, when a designer is on the team and the token count justifies tooling |
| ADR | ADR-D03 |

Token categories (initial):
- `color/*` (per §2)
- `font/family/{sans,mono}`, `font/size/{xs..3xl}`, `font/weight/{normal..bold}`
- `space/{0..96}`
- `radius/{xs,sm,md,lg,pill}`
- `shadow/{none,sm,md,lg}`
- `motion/duration/{fast,base,slow}` `motion/easing/{standard,emphasized}`

---

## 5. Accessibility

| Area | Decision |
|---|---|
| Target | **WCAG 2.2 AA** | ADR-D02 — Norwegian public-sector digital services standard; reasonable private floor |
| Enforcement | Automated: `axe-core` integration in Playwright E2E (delivered by U-D03). Manual: every UI Unit's PR has an a11y checklist line |
| Keyboard | Every interactive element reachable + operable; visible focus rings (not removed); skip-to-content link on every page |
| Screen reader | Semantic HTML first; ARIA only when semantic HTML insufficient; landmarks on every page |
| Color contrast | Minimum 4.5:1 body, 3:1 large text and UI components |
| Touch targets | ≥ 44×44 px (per WCAG 2.5.5 enhanced; informed by mobile-first NFR-PERF) |
| Motion | Respects `prefers-reduced-motion`; no auto-animated marketing |

---

## 6. Responsive design

### Breakpoints (Tailwind defaults — `[FDE-decided]`)

| Token | Min width | Use |
|---|---|---|
| `sm` | 640px | Larger phones, small tablets |
| `md` | 768px | Tablets, foldables |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Wide displays |

### Mobile-first behaviours

- Bottom-sheet pattern for mobile modals; sidebar/dialog for tablet+
- Bottom nav bar on mobile (5 max items); top nav rail on tablet+
- Cards stack vertically on `sm`, two-up on `md+`, three-up on `lg+`
- Touch targets honour the 44px floor (§5)

---

## 7. Standard UX patterns

For every feature, these are the defaults to consume — not reinvent.

| State | Pattern |
|---|---|
| **Loading** | Skeleton loaders (not spinners) for content; spinners only for immediate action feedback |
| **Empty** | Illustration + one-line explanation + primary CTA. No "no data found" alone. |
| **Error** | Full-bleed apology only on page-level failure; inline error otherwise. Always offers a recovery action. |
| **Offline** | Top-bar offline indicator + "data shown was last fetched at <timestamp>" per cached route (NFR-OFF, U-008) |
| **Locale switch** | In the profile page only — not in the main nav. Change takes effect immediately. |
| **Form submission** | Primary button shows the action verb. Disable + spinner while in-flight. On error, focus moves to the first invalid field. |
| **Notifications** | Toasts for transient success/error. Inline persistent banners for blocking conditions. |

---

## 8. Brand voice & writing tone

- **Voice:** Practical, warm, communal, outdoor. Like the wise neighbour who's just back from the cabin. Not corporate. Not start-up.
- **Person:** Addresses the user in **du** (informal Norwegian "you"). English mirror: addresses user directly with "you", no formality.
- **Style:** Imperative verb leads ("Logg vedlikehold" / "Log maintenance"); short sentences; no jargon.
- **Voice example:**
  - ❌ "An error occurred while processing your request"
  - ✅ "Noe gikk galt — prøv igjen om litt." / "Something went wrong — give it a moment and try again."
- **Numbers, dates:** Norwegian formats per locale (15,5 km, not 15.5; DD.MM.YYYY, not YYYY-MM-DD); currency `kr 250,-` Bokmål, `NOK 250` English.

---

## 9. Localization design considerations

| Concern | Decision |
|---|---|
| Text length variance | Bokmål often 15–20% longer than English (Germanic compounds). UI labels are designed with up to **30% growth** headroom. |
| Truncation | Avoid where possible — wrap to second line, don't ellipse user content |
| RTL | Out of scope (no RTL locale at MVP per CI-14) |
| Image text | Locale-aware via SVG with text nodes, or two image versions, depending on case |

---

## 10. Imagery & photo guidelines

| Concern | Decision |
|---|---|
| Cabin photo aspect ratios | 16:9 for cabin exterior, 4:3 for interior, 1:1 for thumbnails |
| Max upload dimension | 4096 × 4096 px (reasonable phone-camera ceiling) |
| Server-side processing | Resize to 1920px max long-edge; generate 480/960/1920 responsive set |
| EXIF | **Stripped on upload** — GDPR R-5 (no coordinates leaked through visitor instruction shares) |
| Alt text | Mandatory on upload; locale-aware; default placeholder if user skips |
| Illustration style | Hand-drawn outline style for empty states (warm, not corporate-stock) `[Simulated designer approval]` |

---

## 11. Designer involvement model

| Concern | Decision |
|---|---|
| Designer role | Unfilled at MVP — Project Champion to staff during early Bolt 0/0.5 work `[Open]` |
| UI Unit review gate | Every UI-affecting Unit's PR requires designer sign-off before merge — added to the Review Checklist when role is filled |
| Working file | Figma (when designer staffed) — read-only public link for the broader team |
| Sync cadence | Designer + FDE pair on the design-system Units; designer reviews each Bolt's UI diff async |
| Source-of-truth conflict resolution | If Figma and in-repo tokens drift, **in-repo wins** until the export tooling lands |

---

## 12. Architecture Decision Records (inline summary)

Full ADR entries land in [`ai-dlc/rules/architecture.md`](../../../rules/architecture.md). List here is the index.

| ID | Decision | Status |
|---|---|---|
| **ADR-D01** | shadcn/ui + Radix Primitives + Tailwind CSS v4 as the component foundation. Customisable primitives owned by the codebase; no vendor lock-in. | Accepted (simulation) |
| **ADR-D02** | WCAG 2.2 AA accessibility target, enforced in CI via axe-core integration. Norwegian public-sector standard; private-sector reasonable floor. | Accepted (simulation) |
| **ADR-D03** | Design tokens live in `platform/frontend/src/design-tokens/*.json` (in-repo), consumed by Tailwind config and CSS custom properties. Figma is a reference at MVP; becomes source-of-truth when token tooling is mature. | Accepted (simulation) |

---

## 13. Candidate design-system Units

These are the Units a DFR would extract from this DFD. Each will get a Unit file when scheduled into Bolt 0 (combined) or Bolt 0.5 (separate).

| # | Candidate Unit | Owning §§ | Notes |
|---|---|---|---|
| **U-D01** | Design tokens scaffolding | §2, §4 | JSON files in `platform/frontend/src/design-tokens/` + Tailwind config wiring + CSS vars on `:root` |
| **U-D02** | shadcn/ui + Tailwind CSS v4 install + theme wiring | §3, §6 | CLI install, theme.json consuming design tokens, base components scaffolded |
| **U-D03** | Accessibility CI gate (axe-core + Playwright) | §5 | Playwright config, axe-core integration, baseline rules; failing PR on serious violations |
| **U-D04** | Component documentation (Storybook *or* in-repo doc) | §3, §7 | Optional but recommended; shows team how patterns compose |

Recommendation for our simulation: **fold U-D01 + U-D02 + U-D03 into Bolt 0** (combined foundational Bolt). U-D04 (Storybook) is optional — defer to Bolt 1 retro to decide.

---

## 14. Open questions

| ID | Question | Owner | Affects |
|---|---|---|---|
| DFD-Q-1 | Who is the designer? When do they join the project? | Project Champion / 99x staffing | §11 — entire DFD validation |
| DFD-Q-2 | Norwegian-foundry typography (Klim, Pangram) at MVP or post-MVP? | Designer (when staffed) | §2 typography |
| DFD-Q-3 | Custom illustration set for empty states vs stock library | Designer + customer | §7, §10 |
| DFD-Q-4 | Dark mode at MVP or post-MVP? Norwegian winter screen-time is significant. | Designer + product | §2 — palette doubling |

---

## 15. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-19 | 0.1 | Initial mock-quality draft. Documents the DFD slot as the third Inception artifact (parallel to PRD and TFD). Three ADRs (D01..D03) committed in simulation; four candidate Units listed (U-D01..U-D04). Designer staffing remains open. | Asitha (FDE) + Claude |
