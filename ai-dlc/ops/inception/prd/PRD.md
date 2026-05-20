# Product Requirements Document — CabinConnect

| Field | Value |
|---|---|
| **Status** | `Draft` |
| **Version** | 0.2 |
| **Derived from** | [`docs/solution/Requirements.md`](../../../../docs/solution/Requirements.md) (customer brief, baseline) |
| **Owner** | Asitha (FDE) |
| **Last updated** | 2026-05-19 |
| **Approval mode** | Simulation — `[Simulated customer approval: …]` markers indicate items added by the team and treated as signed off after customer discussion |

---

## 1. PRFAQ — Working Backwards

### Press Release (future-tense, as if it just launched)

**Oslo, 2026** — CabinConnect launches in Hemsedal: one app for cabin life, community, and neighbours.

Norwegian cabin owners juggle four separate problems: maintaining a cabin they only visit on weekends, staying connected to a community they only see in person twice a year, getting groceries up the mountain on a Friday night, and borrowing the snowblower from a neighbour without making it weird.

CabinConnect brings these together for the first time. From one app, cabin owners track their cabin, see what's happening locally, order groceries from RIMA for pickup or doorstep delivery, and share or borrow tools with the community. The platform is mobile-first, built for Norwegian cabin culture, and runs on shared infrastructure designed for low cost per community.

> *"I used to keep maintenance notes in three places, miss every community event, and forget the snow shovel in Oslo every December. CabinConnect is the first thing that fits how we actually use our cabin."* — Anders, Hemsedal cabin owner

### FAQ

**Q: Who is this for?**
Cabin owners, year-round residents, administrators, and volunteer carriers in Norwegian mountain resort communities.

**Q: Why now?**
Norway has ~450,000 cabins. Existing tools are paper logs, scattered Facebook groups, ad-hoc neighbour texting, and email lists run by hytteforeninger (cabin-owner associations). No one has built the structured digital layer the market keeps reinventing manually.

**Q: What's the business model?**
B2C subscription per Community (small annual fee paid by the cabin owners or the resort association). Future phases may add supplier-side revenue from grocery and tool transactions. [Assumption (customer-approved): subscription model and supplier-side revenue framing 2026-05-19]

**Q: Why not just use Facebook?**
Facebook groups solve none of the structured problems — maintenance logs, order tracking, tool-ownership history, access codes for visitors. The community feed is one module of four, not the product.

**Q: Why a separate platform per Community rather than one global app?**
Cabin communities are inherently local. Each resort has its own social fabric, administrators, and supplier relationships. Data isolation per Community is both a privacy boundary and a UX feature — residents only see what's relevant.

---

## 2. Customer Context

CabinConnect launches at one **pilot Community**: a Hemsedal-region resort with ~600 cabin units and ~1,500 active residents and owners across the year.

**Ownership patterns** *(estimated, will be confirmed at MVP review):*

| Pattern | Share | Notes |
|---|---|---|
| Long-distance owners (Oslo/Bergen-based weekenders) | ~70% | Primary persona for MyCabin + Groceries |
| Multi-generational family-owned cabins | ~25% | Multiple stakeholders per cabin — shared access codes, split costs |
| Year-round local residents | ~5% | Often Administrators, contractors, volunteer carriers |

**Use seasons:**

| Season | Occupancy | Implications |
|---|---|---|
| Easter (mid-March to mid-April) | Peak — skiing | Heaviest grocery + event load |
| Summer (June–August) | Peak — family / outdoor | Tool-sharing surge (cycles, garden) |
| Christmas–New Year | ~80% | Heavy maintenance prep + grocery preorder |
| Random weekends | ~30% baseline | Steady but light load |

[Assumption (customer-approved): pilot Community size, ownership split, and seasonality estimated from customer kick-off conversation 2026-05-12]

---

## 3. Discovery — Personas

### P-1 · Anders & Ingrid — the Long-Distance Owners

| Attribute | Value |
|---|---|
| Age / context | Late 50s, Oslo professionals, two grown children |
| Cabin | Inherited 1990s Hemsedal cabin, used ~25 weekends/year |
| Tech | iPhone, comfortable with Vipps and BankID, suspicious of "yet another app" |
| Goals | Cabin in good condition; minimum coordination friction; both spouses on the same page |
| Frustrations | Maintenance notes scattered across email, Notes app, and a paper log in the cabin; arrives Friday night with no food; forgets which neighbour has the snowblower |

### P-2 · Maja — the Millennial Inheritor

| Attribute | Value |
|---|---|
| Age / context | Early 30s, Bergen-based product designer, recently inherited family cabin |
| Cabin | Shared with two siblings; she does ~60% of the coordination |
| Tech | Power user — Notion, Linear, Slack |
| Goals | Make shared ownership work without family arguments; invite friends without explaining the toilet for 20 minutes |
| Frustrations | No source of truth for access codes; siblings forget to log expenses; existing tools are not designed for shared ownership |

### P-3 · Lars — the Administrator

| Attribute | Value |
|---|---|
| Age / context | Late 40s, year-round resident, runs the resort owners' association, IT background |
| Cabin | Lives in Hemsedal; manages community comms by email and Facebook |
| Tech | Comfortable; would happily abandon Facebook if there were a sensible alternative |
| Goals | Increase event participation; reduce his own admin time; give owners a single channel that isn't Facebook |
| Frustrations | Owners don't see his Facebook posts; email lists hit spam; sign-up sheets are paper at the community house |

### P-4 · Tor — the Volunteer Carrier

| Attribute | Value |
|---|---|
| Age / context | Mid-60s, retired teacher, year-round local |
| Cabin | Year-round house in the village, not a cabin owner |
| Tech | Android, comfortable with Vipps, basic apps; reading glasses |
| Goals | Stay useful; earn a small thank-you fee or volunteer goodwill; help long-distance neighbours who can't get up in time |
| Frustrations | Arrangements happen by phone tag and slip his memory; no clear way to know who needs help |

### P-5 · Sofie — the RIMA Supplier Contact

| Attribute | Value |
|---|---|
| Age / context | 30s, RIMA Hemsedal store manager |
| Cabin | N/A — supplier-side |
| Goals | Predictable Friday afternoon volume; fewer phone orders; better picker handoff |
| Frustrations | Cabin owners call from the E16 to "add four more things"; existing supplier integrations are clunky |

[Discovery insight: I-1, I-2, I-4 are derived from these personas; see §6.]

---

## 4. Discovery — Domain Notes

### 4.1 Norwegian cabin (hytte) culture

- ~450,000 cabins in Norway against a population of ~5.5M — among the deepest cabin cultures in Europe.
- The cabin is a *second home*, not a vacation rental in the Airbnb sense. Owners identify with their cabins. This shapes the tone: CabinConnect is for owners' *daily life*, not occasional bookings.
- **Dugnad** — the Norwegian tradition of collective volunteer work for shared spaces — is alive in cabin communities. The volunteer carrier model in Groceries (GR-04) is culturally native, not novel.

### 4.2 Seasonality

- Activity is bursty: Easter, summer, Christmas. The product must handle 10× normal load on three specific weekends.
- Tool-sharing peaks shift with season — ski equipment in winter, garden/water sports in summer, repair tools year-round.

### 4.3 Connectivity

- Cabin areas frequently have weak mobile signal. Connectivity in the cabin itself is patchy; better at the village centre.
- **Implication:** critical reads (visitor instructions, today's events, current orders) must work offline once loaded. Writes can require connectivity.

### 4.4 Identity, payments, regulation

- **BankID** is the universal Norwegian digital ID. Future integration likely — not MVP.
- **Vipps** is ubiquitous for peer payments. Future integration for ToolShare and Groceries — not MVP. CabinConnect itself is not a payment processor (see Non-Goals §8).
- **GDPR** applies (Norway is EEA). Visitor instructions accessed without an account need careful handling — signed time-limited links, no analytics tracking on those reads.

### 4.5 Existing community fabric

- Most resorts have a *hytteforening* (cabin-owners' association) running comms by email and an annual general meeting. CabinConnect should make the administrator's job easier, not replace the association.
- Facebook groups are the incumbent for daily chatter — entrenched, but universally complained about.

---

## 5. Discovery — Competitor Analysis

| Competitor | Category | What they do well | What they miss | Threat level |
|---|---|---|---|---|
| **Facebook Groups** | Community chatter (incumbent) | Zero install friction; everyone is on it | No structure: no maintenance log, no order tracking, no tool history; algorithmic feed hides important posts | **High** — habit lock-in, not feature lock-in |
| **Hyttebok / Hyttepappa** | Cabin diary apps | Native cabin maintenance focus; some loyal users | Single-purpose; no community or marketplace; dated UX | Medium — overlaps MyCabin only |
| **Hytteforening email lists** | Owners' association comms | Trusted channel; administrator-controlled | Email; spam folder; no structured response; one-way | Medium — incumbent for events only |
| **Nextdoor** | Neighbourhood social | Strong community model; verified addresses | US/UK-centric; not Norwegian cabin-aware; no marketplace structure | Low — wrong cultural fit |
| **Finn.no** | Norwegian classifieds | Universal trust; everyone uses it for buy/sell | Not community-scoped; not designed for short-term lending; no relationship to owners | Medium — direct overlap with ToolShare |
| **Vipps** | Peer payments | Universal Norwegian adoption | Not a community platform; payments only | Not a competitor — likely a future partner |
| **TooGoodToGo** | Sharing-economy precedent | Proves Norwegian appetite for local sharing-economy apps | Different vertical (food waste); model relevance only | Reference — not a competitor |
| **Airbnb** | Adjacent rental | Trusted for cabin rentals | Rental-only; opposite of "owner's daily life" framing | Adjacent — not a competitor |

### What this competitor map tells us

The **real competitor is Facebook Groups**, not other cabin apps. Feature parity with Facebook is not enough; we win by giving structure that Facebook structurally cannot give — maintenance logs, order status, tool ownership history.

---

## 6. Discovery — Key Insights

The five distilled findings that actually shape the product.

| # | Insight | Where it lands in scope |
|---|---|---|
| **I-1** | The biggest cabin-owner pain is **coordination across multiple stakeholders** (spouse, siblings, neighbours, contractors) — not the absence of any single feature | Shared cabin profiles with multiple owners (MyCabin) and shareable visitor instructions |
| **I-2** | The **dugnad / volunteer carrier model is culturally native** in Norwegian cabin life. Doorstep delivery via volunteers is plausible from day one if framed as community help, not gig work | Groceries delivery is in MVP (with phased rollout per Requirements.md) — confidence higher than the customer brief suggests |
| **I-3** | **Critical reads must work offline.** Cabin connectivity is patchy. Visitor instructions, today's events, and current orders being unavailable when the user actually needs them is a P0 UX failure | NFR-OFF added (see §10); MyCabin and Events read paths must cache |
| **I-4** | **Facebook is the real incumbent**, not other cabin apps. Habit lock-in is the wall to climb, not features | Events module must beat Facebook for community signal — push notifications for opt-ins, not algorithmic feed |
| **I-5** | **The Administrator is the unsung adoption lever.** If Lars adopts CabinConnect for Events, the community follows. If he doesn't, owners never form a habit | Administrator tooling for Events is given disproportionate care; admins onboarded by the FDE personally during pilot |

---

## 7. Problem Statement

Norwegian cabin owners have no structured digital layer for cabin life. Maintenance lives on paper. Community lives on Facebook. Groceries live on phone calls. Tools live on hope. The result is constant low-grade friction — forgotten supplies, missed events, repeated questions about access codes, neighbours who would help if only they knew help was needed.

CabinConnect closes this gap with one mobile-first platform per Community: cabin profile, community events, grocery ordering, and tool sharing — built for how cabin life actually happens.

---

## 8. Goals & Non-Goals

### Goals (in priority order)

1. **Reduce coordination friction** across the cabin lifecycle (visitors, family, neighbours, contractors)
2. **Strengthen Community participation** by giving administrators a channel that beats Facebook for structured signal
3. **Make Friday-night cabin arrival smooth** — groceries waiting, no fuss
4. **Enable lightweight peer sharing of tools** with accountability

### Non-Goals (explicit)

| Non-goal | Why it's out |
|---|---|
| Cabin booking / rental platform | Wrong product; would compete with Airbnb and conflate with the inherited "booking platform" framing in legacy CLAUDE.md content |
| Payment processor | Vipps exists; we integrate later, do not become one |
| Generic social network | Scope is cabin life. No general posts, no profile feeds. |
| Property listings (for-sale cabins) | Finn.no's territory; no overlap with our value |
| Multi-Community federation in MVP | Each Community is isolated; cross-Community discovery is post-MVP |
| Direct messaging beyond event/order/tool context | Use existing channels (Vipps, SMS); we are not a messenger |

---

## 9. Product Scope

This is the customer-brief functional requirements list, refined and attributed. The original `Requirements.md` IDs (MC-, EV-, GR-, TS-) are preserved so traceability is intact. Additional IDs in each module (and the new §9.5 Cross-cutting) close gaps surfaced by the §3–§6 discovery work.

**Attribution and approval markers:**
- `[Customer brief: …]` — directly from `docs/solution/Requirements.md`
- `[Discovery insight: I-x]` — derived from a finding in §6
- `[Simulated customer approval: 2026-05-19]` — added by the team and, in simulation mode, treated as signed off after customer discussion

**Completeness vs scope.** This section lists *requirements* — everything the system might need to support. Whether each one is built in MVP, post-MVP, or never, is a separate decision made through the Candidate Intents in §13 and their MVP priority tags. The point is to minimise the requirement gap so the technical landscape is fully visible *before* architectural commitments are made. See [`project-review/notes.md`](../../../../project-review/notes.md) for the broader principle.

### 9.1 MyCabin

| ID | Requirement | Source |
|---|---|---|
| MC-01 | A Cabin Owner can register and manage their cabin profile (name, location, capacity, amenities) | [Customer brief: MC-01] |
| MC-02 | A Cabin Owner can store and update key cabin information (access codes, emergency contacts, rules) | [Customer brief: MC-02] |
| MC-03 | A Cabin Owner can log and track Maintenance Tasks with status and history | [Customer brief: MC-03] |
| MC-04 | A Cabin Owner can calculate and view estimated ownership costs (utilities, maintenance, fees) | [Customer brief: MC-04] |
| MC-05 | A Cabin Owner can create and share Visitor Instructions with invited guests | [Customer brief: MC-05] |
| MC-06 | Visitor Instructions can be accessed by guests without requiring a full account, via a signed time-limited link | [Customer brief: MC-06] + [Simulated customer approval: 2026-05-19] (signed time-limited link mechanism for GDPR-compliant access) |
| MC-07 | A cabin profile can have multiple Cabin Owners (e.g. siblings sharing inheritance), each with full management permissions | [Discovery insight: I-1] + [Simulated customer approval: 2026-05-19] |
| MC-08 | Critical MyCabin reads (Visitor Instructions, Maintenance Tasks for next 14 days) are available offline once loaded | [Discovery insight: I-3] + [Simulated customer approval: 2026-05-19] |
| MC-09 | A Cabin Owner can upload and manage cabin photos with primary photo selection (per-cabin quantity cap subject to NFR-COST envelope — see Q-6) | [Discovery: standard cabin-platform feature, gap closure] + [Simulated customer approval: 2026-05-19] |
| MC-10 | A Maintenance Task can be marked as recurring on a fixed schedule (e.g. quarterly, seasonally); the system auto-creates the next occurrence | [Discovery: Norwegian cabin maintenance seasonality] + [Simulated customer approval: 2026-05-19] |
| MC-11 | A Maintenance Task can record an actual cost; recorded costs feed the ownership cost calculator (MC-04) for actual-vs-estimated tracking | [Discovery: bridges MC-03 and MC-04] + [Simulated customer approval: 2026-05-19] |
| MC-12 | Co-owners of a Cabin can see each other's recent edits and additions (Maintenance Tasks, Visitor Instructions, costs) on a shared activity log | [Discovery insight: I-1, Persona P-2 Maja] + [Simulated customer approval: 2026-05-19] |
| MC-13 | A Cabin Owner can list active Visitor Instructions shared links, see their expiry, and revoke any of them before expiry | [Discovery: MC-06 + R-5 GDPR completeness] + [Simulated customer approval: 2026-05-19] |

### 9.2 Events

| ID | Requirement | Source |
|---|---|---|
| EV-01 | An Administrator can create, edit, and publish Events visible to all Residents in their Community | [Customer brief: EV-01] |
| EV-02 | A Resident can browse upcoming Events filtered by date and category | [Customer brief: EV-02] |
| EV-03 | A Resident can register interest or attendance for an Event | [Customer brief: EV-03] |
| EV-04 | An Administrator can manage attendee lists and send Event updates | [Customer brief: EV-04] |
| EV-05 | Events are Community-scoped — users see only their Community's Events | [Customer brief: EV-05] |
| EV-06 | A Resident opted-in to a category receives push notification for new Events in that category | [Discovery insight: I-4] + [Simulated customer approval: 2026-05-19] |
| EV-07 | Administrators have a setup checklist on first use to encourage early publication | [Discovery insight: I-5] + [Simulated customer approval: 2026-05-19] |
| EV-08 | An Administrator can view a Community adoption dashboard — registered Cabin Owners count, monthly active count, recent Events with attendance metrics | [Discovery insight: I-5, Persona P-3 Lars] + [Simulated customer approval: 2026-05-19] |
| EV-09 | An Administrator can broadcast a Community-wide announcement separate from structured Events; announcements have a published date, optional expiry, dedicated feed, and push to opted-in Residents | [Discovery insight: I-4, Persona P-3 Lars] + [Simulated customer approval: 2026-05-19] |

### 9.3 Groceries

| ID | Requirement | Source |
|---|---|---|
| GR-01 | A Cabin Owner can browse and order Groceries from a connected Supplier (initial partner: RIMA) | [Customer brief: GR-01] |
| GR-02 | A Cabin Owner can schedule a Pickup Order timed to their journey to the cabin | [Customer brief: GR-02] |
| GR-03 | A Cabin Owner can place a Delivery Order for doorstep delivery at their cabin | [Customer brief: GR-03] |
| GR-04 | A volunteer can register as a Carrier and accept Delivery Orders | [Customer brief: GR-04] + [Discovery insight: I-2] + [Simulated customer approval: 2026-05-19] (confidence elevated by I-2 vs customer's phased framing) |
| GR-05 | A Cabin Owner can track Order Status (`Placed` / `Ready` / `InTransit` / `Delivered`) | [Customer brief: GR-05] |
| GR-06 | The system notifies the Cabin Owner when Order Status changes | [Customer brief: GR-06] |
| GR-07 | A Cabin Owner can edit an order until the Supplier marks it `Ready` (the "add four more things on the E16" pattern) | [Discovery insight: I-1, Persona P-5 frustration] + [Simulated customer approval: 2026-05-19] |
| GR-08 | After a Delivery Order is marked `Delivered`, the Cabin Owner can rate the Carrier on a thumbs up/down basis with optional comment; ratings inform future Carrier–Order matching | [Discovery: R-2 mitigation completeness] + [Simulated customer approval: 2026-05-19] |

### 9.4 ToolShare

| ID | Requirement | Source |
|---|---|---|
| TS-01 | A Cabin Owner can list a Tool Listing available for lending or rental | [Customer brief: TS-01] |
| TS-02 | A Cabin Owner can browse Tool Listings in their local Community | [Customer brief: TS-02] |
| TS-03 | A Cabin Owner can submit a Loan Request for a listed tool for a specified period | [Customer brief: TS-03] |
| TS-04 | A tool owner can approve or decline a Loan Request | [Customer brief: TS-04] |
| TS-05 | Both parties can see Tool Status (`Available` / `Reserved` / `OnLoan`) | [Customer brief: TS-05] |
| TS-06 | The system records Loan Records for accountability and dispute resolution | [Customer brief: TS-06] |
| TS-07 | When a Loan Request is submitted, the tool owner is push-notified | [Discovery insight: I-1] + [Simulated customer approval: 2026-05-19] |
| TS-08 | Tool Listings carry a category (Power tools / Garden / Winter equipment / Repair / Outdoor / Other); the Community browse view supports category filter and seasonal-availability indicator | [Discovery: competitor Finn.no + seasonality] + [Simulated customer approval: 2026-05-19] |

### 9.5 Cross-cutting

Requirements that span all four modules — recorded once to avoid duplication. Implementations of MC, EV, GR, TS items must honour these.

| ID | Requirement | Source |
|---|---|---|
| XC-01 | System-generated user-facing copy (UI labels, notification text, error messages, emails) is available in Norwegian Bokmål and English; rendered per recipient's locale | [Discovery: NFR-LOC operationalised at functional level] + [Simulated customer approval: 2026-05-19] |
| XC-02 | User-generated content (Event descriptions, Tool Listings, Maintenance Task notes) is stored as entered, not translated. Locale-aware rendering applies to dates, numbers, and currency only. | [Discovery: NFR-LOC operationalised at functional level] + [Simulated customer approval: 2026-05-19] |

---

## 10. Non-Functional Requirements

The customer brief's NF-01..NF-06 are labels. The PRD adds measurable thresholds.

| ID | NFR | Measurable threshold | Source |
|---|---|---|---|
| **NFR-PERF** | Mobile-first performance | p95 page load < 3s on a 4G connection; p95 API response < 500 ms | [Customer brief: NF-04] + threshold added |
| **NFR-COST** | Low operating cost per Community | Cloud cost target ≤ €30/month per active Community at MVP scale (~600 cabins) | [Customer brief: NF-06] + [Assumption (customer-approved): €30 budget envelope] |
| **NFR-ISO** | Community data isolation | Zero cross-Community data leaks; verified by automated test on every PR and a manual security audit pre-launch | [Customer brief: NF-03] + threshold added |
| **NFR-AUTH** | Authenticated mutations | 100% of data-mutating endpoints require Supabase JWT; visitor-instruction reads use signed time-limited links | [Customer brief: NF-05] |
| **NFR-OFF** | Offline critical reads | Visitor Instructions, Maintenance Tasks (next 14 days), today's Events, and active Orders are available offline for 24h once loaded | [Discovery insight: I-3] |
| **NFR-LOC** | Localization | Norwegian (Bokmål) and English from day one; locale resolved from user profile, browser, then default Norwegian | [Assumption (customer-approved): Norwegian + English from day one] |
| **NFR-BROWSER** | Browser & device support | Latest 2 versions of iOS Safari, Android Chrome, desktop Chrome / Edge / Safari | [Assumption (customer-approved): standard support matrix] |
| **NFR-AVAIL** | Availability | 99.5% uptime monthly during MVP; 99.9% post-pilot | [Assumption (customer-approved): MVP availability target] |
| **NFR-SCALE** | Horizontal scaling | Architecture supports adding new Communities without code changes; tested to 10 concurrent Communities | [Customer brief: NF-02] + threshold added |

---

## 11. Risks & Mitigations

| ID | Risk | Likelihood × Impact | Mitigation |
|---|---|---|---|
| **R-1** | Facebook group habit lock-in prevents adoption | High × High | Administrator personally onboarded; push notifications for opt-ins; one structured feature (orders or maintenance) wins individual cabin owners before community is asked to switch |
| **R-2** | Volunteer Carrier reliability — orders not delivered, owner disappointed | Med × High | Pickup is the default fulfilment mode; delivery is an upsell. Carrier ratings/feedback in phase 2. |
| **R-3** | RIMA supplier integration scope/timeline unclear | Med × High | MVP can ship with manual order handoff (PDF order to RIMA staff) if integration slips; Groceries pickup launches without full API |
| **R-4** | Cabin connectivity makes app feel broken | High × Med | Aggressive offline-first design on critical reads (NFR-OFF) |
| **R-5** | GDPR liability for Visitor Instructions accessed without an account | Low × High | Signed time-limited links; no analytics tracking on those routes; data minimization (no contact list collection on visitor side) |
| **R-6** | Multi-owner cabin permission complexity creates support burden | Med × Med | Co-owner model is full-permission-equal in MVP (no roles per owner); refined post-MVP based on incident data |
| **R-7** | Per-Community subscription model fails to monetize | Med × Med | Pilot Community gets free year; revenue model decided at end of pilot based on usage data |
| **R-8** | Model/API cost from AI-DLC tooling (Xianix routing) exceeds NFR-COST envelope | Low × Med | Cost tracked per Community; Xianix L1 adapter swap available; model routing favours cheaper models for non-critical work |

---

## 12. Measurement Criteria

How we will know CabinConnect is working — measured at the end of the pilot (6 months post-launch).

| ID | Metric | Target |
|---|---|---|
| **M-1** | % of pilot Community cabin owners registered | ≥ 60% |
| **M-2** | DAU / MAU ratio | ≥ 25% during peak seasons (Easter, summer, Christmas) |
| **M-3** | MyCabin profiles with ≥ 1 Maintenance Task logged | ≥ 50% of registered owners |
| **M-4** | Events created per month per Community | ≥ 4 (target: replace Facebook for community-wide events) |
| **M-5** | Event Registrations per Event | ≥ 30% of expected attendance estimated by Administrator |
| **M-6** | Grocery Orders per month per active cabin owner | ≥ 1 during peak seasons |
| **M-7** | Tool Listings created in first 3 months | ≥ 20 per Community |
| **M-8** | Loan Requests fulfilled | ≥ 70% of submitted requests reach `OnLoan` |
| **M-9** | NPS at end of pilot | ≥ 40 (good for an early product) |
| **M-10** | Operational cost per Community per month | ≤ €30 (matches NFR-COST) |

Each metric traces to one of the four Goals in §8.

---

## 13. Candidate Intents

This is the **bridge into AI-DLC**. Each candidate Intent below is a capability-sized chunk that can be expanded into its own `ai-dlc/ops/inception/intents/YYYY-MM-DD-<slug>.md` file when we decide to pursue it. Order is *suggested execution order*, not commitment.

We mark each candidate with an MVP-priority tag matching `Requirements.md`'s MVP scope:

- **MVP-H** — High priority MVP (must ship for pilot launch)
- **MVP-M** — Medium priority MVP (can phase after pickup is live)
- **POST** — Post-MVP

| # | Candidate Intent | Module | Priority | Notes |
|---|---|---|---|---|
| **CI-01** | Community boundary & data isolation foundation | Cross-cutting | MVP-H | Foundational — every other intent depends on this. RLS, server-side scoping, NFR-ISO automated test |
| **CI-02** | Cabin Owner registration + auth (Supabase Auth) | Cross-cutting | MVP-H | Foundational — Supabase Auth, profile creation, locale resolution |
| **CI-03** | Cabin profile registration and management | MyCabin | MVP-H | MC-01, MC-02, MC-07 (multi-owner) |
| **CI-04** | Maintenance Tasks logging and history | MyCabin | MVP-H | MC-03; with offline read support (NFR-OFF) |
| **CI-05** | Visitor Instructions creation & guest-accessible signed-link sharing | MyCabin | MVP-H | MC-05, MC-06; GDPR-careful (R-5) |
| **CI-06** | Ownership cost calculator | MyCabin | MVP-M | MC-04; less critical for Friday-night arrival flow |
| **CI-07** | Administrator Events publication & management | Events | MVP-H | EV-01, EV-04, EV-07 (admin onboarding checklist) |
| **CI-08** | Resident Events browsing, registration, push notifications | Events | MVP-H | EV-02, EV-03, EV-06 |
| **CI-09** | Grocery Order placement and Pickup fulfilment | Groceries | MVP-H | GR-01, GR-02, GR-05, GR-06, GR-07 (editable until Ready) |
| **CI-10** | Grocery Delivery + volunteer Carrier model | Groceries | MVP-M | GR-03, GR-04; phased after Pickup is live (per Requirements.md guidance) |
| **CI-11** | Tool Listings creation and Community browsing | ToolShare | MVP-M | TS-01, TS-02 |
| **CI-12** | Loan Requests, approval, status tracking, history | ToolShare | MVP-M | TS-03, TS-04, TS-05, TS-06, TS-07 |
| **CI-13** | Offline-first caching for critical reads | Cross-cutting | MVP-H | NFR-OFF; touches MyCabin, Events, Groceries |
| **CI-14** | Norwegian + English localization | Cross-cutting | MVP-H | NFR-LOC |
| **CI-15** | Administrator onboarding flow + adoption telemetry | Cross-cutting | MVP-M | Supports I-5 (Administrator as adoption lever); covers EV-08 dashboard signals and measurement M-4 |
| **CI-16** | Co-owner shared activity log | MyCabin | MVP-M | MC-12; depends on CI-03 multi-owner foundation |
| **CI-17** | Administrator Community-wide announcements (Facebook alternative) | Events | MVP-M | EV-09; distinct from structured Events — informal broadcast channel |

> Note: CI coverage was re-checked after the §9 completeness pass (PRD v0.2). New requirements MC-09 (photos), MC-10 (recurring tasks), MC-11 (cost link), MC-13 (link revocation), GR-08 (Carrier ratings), and TS-08 (tool categories) are folded into the existing CI-03 / CI-04 / CI-05 / CI-10 / CI-11 scopes respectively and will be picked up when those CIs are elaborated.

When we open the first Intent file, it will be **CI-03 (Cabin profile registration and management)** — the most concrete starting point that exercises multi-owner (I-1) and is small enough to elaborate in one session.

---

## 14. Out of Scope (MVP)

Explicit boundary statements — restated from §8 for the build phase to reference.

- Cabin booking and rental flows (no Booking, no Guest, no Host, no Hold, no rates — these are *not* CabinConnect concepts)
- Payment processing — defer to Vipps when payments become relevant
- Cross-Community discovery, federation, or unified user view across multiple resorts
- Direct messaging between users outside the Order / Loan Request / Event context
- Cabin for-sale listings or property valuation
- Smart-cabin device integration (locks, thermostats, sensors)
- Insurance claims workflow
- Native mobile apps — MVP is a responsive web app installable as a PWA

---

## 15. Open Questions

Unresolved items requiring customer or stakeholder input.

| ID | Question | Owner | Blocking |
|---|---|---|---|
| **Q-1** | RIMA partnership terms — API integration scope, fees, timeline, exclusivity? | Customer / commercial | Blocks CI-09 final design |
| **Q-2** | BankID integration — MVP requirement or post-pilot? | Customer | Blocks CI-02 scope |
| **Q-3** | Carrier liability and insurance model — does the Community Association cover, or is it carrier's own responsibility? | Customer / legal | Blocks CI-10 |
| **Q-4** | Multi-Community users (someone who owns cabins in two resorts) — supported in MVP or post-MVP? | Customer | Affects CI-01 |
| **Q-5** | Subscription pricing and who pays (owner, hytteforening, mixed) | Customer / commercial | Not blocking MVP build |
| **Q-6** | Photo storage cost envelope under NFR-COST — do we allow unlimited cabin photos, or cap? | Engineering / customer | Affects CI-03 |
| **Q-7** | Push notification provider — native push via Web Push API only, or also SMS fallback for Norway's "older cabin owner" demographic? | Engineering / customer | Affects CI-08, CI-12 |

---

## 16. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-19 | 0.1 | Initial draft created from `docs/solution/Requirements.md` enriched with discovery, competitor analysis, NFR thresholds, risks, measurement criteria, and candidate Intents | Asitha + Claude |
| 2026-05-19 | 0.2 | Requirement completeness pass on §9: added MC-09..MC-13, EV-08..EV-09, GR-08, TS-08, and new §9.5 Cross-cutting (XC-01, XC-02). Introduced `[Simulated customer approval]` marker on all team-added items (16 total). Added CI-16 (co-owner activity log) and CI-17 (Administrator announcements) to §13. Approval-mode definition in header updated. | Asitha + Claude |
