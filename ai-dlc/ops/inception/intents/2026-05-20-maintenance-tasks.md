# Intent: Maintenance Task Logging

**Status:** Ready
**Date:** 2026-05-20
**Owner:** Sachith Perera

---

## What

Cabin owners can log, track, and view maintenance tasks for their cabin — each with a title, description, optional due date, and a lifecycle status of Pending, In Progress, Done, or Cancelled.

## Why

Cabin owners need a running record of what maintenance has been done and what is outstanding. Without this, upkeep tasks are tracked in personal notes or memory, making it easy to miss work, lose history, and hand over a cabin without context. A structured task log gives owners visibility into the state of their property and builds a history of decisions and work over time.

## Success Looks Like

- A cabin owner can create a new maintenance task for one of their cabins with a title, optional description, optional due date, and an initial status of Pending
- A cabin owner can update a task's title, description, due date, or status at any time
- A cabin owner can view all tasks for a cabin, with the ability to filter by status
- A cabin owner can delete a task they no longer need
- Tasks for one cabin are never visible to owners of another cabin

## Assumptions

- Tasks belong to exactly one cabin; a task cannot span multiple cabins
- Only the cabin owner can create, edit, delete, or view tasks for their cabin — enforced by RLS and server-side ownership check
- Status transitions are unrestricted — any status can be set to any other status
- Categories are out of scope; title and description provide sufficient context
- Attachments (photos, receipts) are out of scope for this intent

## Open Questions

None — all resolved before elaboration:
- Due date: included as an optional field
- Categories: out of scope; free-text title and description only
- Statuses: `Pending` / `InProgress` / `Done` / `Cancelled`

## Out of Scope

- Cost tracking or expense logging against tasks (MC-04 — Ownership Costs, separate intent)
- Notifications or reminders for overdue or upcoming tasks
- Task assignment to other users
- File or photo attachments
- Recurring task scheduling
- Deactivating a cabin's task list when a cabin is deactivated (deferred — Deactivate Cabin unit is also deferred)

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| — | — | — |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| — | — | — |
