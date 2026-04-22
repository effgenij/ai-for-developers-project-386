# Backend Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Fastify backend that implements the calendar booking contract with in-memory storage and server-side booking conflict checks.

**Architecture:** Keep Fastify route registration thin and move booking rules into a small domain service backed by an in-memory store. Validate requests at the HTTP layer with schemas that mirror the contract, then map domain outcomes to contract status codes and error payloads.

**Tech Stack:** Fastify 5, Node.js 22, TypeScript, `tsx --test`, in-memory storage

---

## File Structure

- Modify: `apps/backend/package.json`
- Modify: `apps/backend/src/app.ts`
- Create: `apps/backend/src/app.test.ts`
- Create: `apps/backend/src/domain/calendar-service.ts`
- Create: `apps/backend/src/domain/types.ts`
- Create: `apps/backend/src/store/memory-store.ts`

### Task 1: Backend Test Harness

**Files:**
- Modify: `apps/backend/package.json`
- Create: `apps/backend/src/app.test.ts`

- [ ] Add a backend test script using `tsx --test`.
- [ ] Write a failing API test that expects `GET /api/event-types` to return `[]`.
- [ ] Run `npm run test --workspace @repo/backend` and verify the test fails because the route is missing.

### Task 2: Event Types API

**Files:**
- Create: `apps/backend/src/domain/types.ts`
- Create: `apps/backend/src/store/memory-store.ts`
- Create: `apps/backend/src/domain/calendar-service.ts`
- Modify: `apps/backend/src/app.ts`
- Modify: `apps/backend/src/app.test.ts`

- [ ] Write failing tests for create/list/read/update/delete event type flows, including `404` and delete-with-bookings protection.
- [ ] Run the targeted backend tests and verify they fail for the expected missing behavior.
- [ ] Implement the in-memory store and event type domain operations.
- [ ] Wire Fastify routes with request/response schemas matching the contract.
- [ ] Re-run the backend tests and verify the new event type scenarios pass.

### Task 3: Available Slots API

**Files:**
- Modify: `apps/backend/src/domain/calendar-service.ts`
- Modify: `apps/backend/src/app.ts`
- Modify: `apps/backend/src/app.test.ts`

- [ ] Write failing tests for available slots generation in the `09:00-18:00 UTC` window and for excluding occupied slots.
- [ ] Run the targeted tests and verify they fail for slot generation.
- [ ] Implement slot generation based on event duration and booking overlap checks.
- [ ] Re-run the tests and verify available slot scenarios pass.

### Task 4: Bookings API

**Files:**
- Modify: `apps/backend/src/domain/calendar-service.ts`
- Modify: `apps/backend/src/app.ts`
- Modify: `apps/backend/src/app.test.ts`

- [ ] Write failing tests for booking creation, conflict detection across event types, future booking listing, and cancellation.
- [ ] Run the targeted tests and verify they fail for booking behavior.
- [ ] Implement booking domain operations, including computed `endTime` and `409` conflict handling.
- [ ] Re-run the tests and verify booking scenarios pass.

### Task 5: Final Verification

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/backend/src/app.ts`
- Modify: `apps/backend/src/app.test.ts`
- Modify: `apps/backend/src/domain/calendar-service.ts`
- Modify: `apps/backend/src/domain/types.ts`
- Modify: `apps/backend/src/store/memory-store.ts`

- [ ] Run `npm run test --workspace @repo/backend`.
- [ ] Run `npm run check-types --workspace @repo/backend`.
- [ ] Run `npm run build --workspace @repo/backend`.
- [ ] Fix any failures and re-run the full verification commands.
