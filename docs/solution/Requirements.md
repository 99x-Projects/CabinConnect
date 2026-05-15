# CabinConnect — High-Level Requirements

CabinConnect connects cabin owners, local businesses, and neighbors through one app — a digital layer for sustainable, social, and convenient cabin life. The MVP comprises four modules.

---

## Module 1 — MyCabin

A structured data hub for cabin owners.

### Functional Requirements

| ID | Requirement |
|---|---|
| MC-01 | A cabin owner can register and manage their cabin profile (name, location, capacity, amenities) |
| MC-02 | A cabin owner can store and update key cabin information (access codes, emergency contacts, rules) |
| MC-03 | A cabin owner can log and track maintenance tasks with status and history |
| MC-04 | A cabin owner can calculate and view estimated ownership costs (utilities, maintenance, fees) |
| MC-05 | A cabin owner can create and share visitor instructions with invited guests |
| MC-06 | Visitor instructions can be accessed by guests without requiring a full account |

---

## Module 2 — Events

A platform for publishing and managing local community events.

### Functional Requirements

| ID | Requirement |
|---|---|
| EV-01 | An administrator can create, edit, and publish events visible to all residents |
| EV-02 | A resident can browse upcoming events filtered by date and category |
| EV-03 | A resident can register interest or attendance for an event |
| EV-04 | An administrator can manage attendee lists and send event updates |
| EV-05 | Events are scoped to a specific resort or community — users see only their community's events |

---

## Module 3 — Groceries

Seamless grocery pickup and delivery for cabin owners.

### Functional Requirements

| ID | Requirement |
|---|---|
| GR-01 | A cabin owner can browse and order groceries from a connected supplier (initial partner: RIMA) |
| GR-02 | A cabin owner can schedule a pickup order timed to their journey to the cabin |
| GR-03 | A cabin owner can place a delivery order for doorstep delivery at their cabin |
| GR-04 | A volunteer can register as a delivery carrier and accept delivery requests |
| GR-05 | A cabin owner can track the status of their order (placed, ready, in transit, delivered) |
| GR-06 | The system notifies the cabin owner when their order status changes |

> GR-03 and GR-04 are a demanded feature (volunteer-based doorstep delivery) and may be phased after core pickup is live.

---

## Module 4 — ToolShare

A community sharing economy for tools and equipment.

### Functional Requirements

| ID | Requirement |
|---|---|
| TS-01 | A cabin owner can list a tool or piece of equipment available for lending or rental |
| TS-02 | A cabin owner can browse available tools in their local community |
| TS-03 | A cabin owner can request to borrow or rent a listed tool for a specified period |
| TS-04 | A tool owner can approve or decline a borrow/rental request |
| TS-05 | Both parties can see the current status of a tool (available, reserved, on loan) |
| TS-06 | The system records loan history for accountability and dispute resolution |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF-01 | The system must be cloud-ready and deployable on shared cloud infrastructure |
| NF-02 | The system must be lightweight and scalable to support multiple Norwegian resorts |
| NF-03 | Each community (resort) is isolated — users only see data for their own community |
| NF-04 | The system must support mobile-first usage (cabin owners on the go) |
| NF-05 | Authentication is required for all data-mutating actions; browsing may be partially public |
| NF-06 | The system must be operable at low cost, suitable for a shared-hosting model |

---

## MVP Scope

The MVP prioritises low complexity, strong user value, and clear monetization pathways.

| Module | MVP Priority | Notes |
|---|---|---|
| MyCabin | High | Core value proposition; foundation for other modules |
| Events | High | Low complexity; high resident engagement value |
| Groceries — Pickup | High | Demanded feature; start with RIMA as the single supplier |
| Groceries — Delivery | Medium | Volunteer model adds complexity; phase after pickup |
| ToolShare | Medium | Community value; depends on critical mass of users |
