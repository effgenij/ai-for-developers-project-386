# Backend Contract Design

## Goal

Implement the backend strictly from the API contract in `packages/api-spec/main.tsp`, with in-memory storage and server-side booking rules.

## Scope

- Implement all backend endpoints described by the contract.
- Keep state in memory only.
- Enforce booking conflicts across all event types.
- Forbid deleting an event type when it already has bookings.

## Architecture

- Fastify remains a thin HTTP layer responsible for routing, request validation, and status codes.
- Domain logic lives outside route handlers so booking rules are expressed independently from the framework.
- In-memory storage holds two collections: `eventTypes` and `bookings`.

## Domain Model

### EventType

- `id: string`
- `name: string`
- `description: string`
- `durationMinutes: number`

### Booking

- `id: string`
- `eventTypeId: string`
- `eventTypeName: string`
- `startTime: string`
- `endTime: string`
- `guest: { name: string; email: string }`

## API Behavior

### Event Types

- `GET /api/event-types` returns all event types.
- `POST /api/event-types` creates a new event type and returns `201`.
- `GET /api/event-types/:id` returns the event type or `404`.
- `PATCH /api/event-types/:id` updates only provided fields, returns `404` if missing, and returns `400` for invalid payloads.
- `DELETE /api/event-types/:id` returns:
  - `404` if the event type does not exist;
  - `400` if the event type has at least one booking;
  - `204` on successful deletion.

### Available Slots

- `GET /api/event-types/:id/available-slots?date=YYYY-MM-DD` returns `404` if the event type does not exist.
- Slots are generated inside the fixed daily window `09:00-18:00 UTC`.
- Slot duration equals the event type duration.
- A slot is returned only if its interval does not overlap any booking, regardless of event type.

### Bookings

- `GET /api/bookings` returns only future bookings sorted by ascending `startTime`.
- `POST /api/bookings`:
  - returns `404` if `eventTypeId` does not exist;
  - computes `endTime` on the server from the event type duration;
  - returns `409` if the requested interval overlaps any existing booking;
  - stores denormalized `eventTypeName` and returns `201` on success.
- `DELETE /api/bookings/:id` returns `404` if missing and `204` on success.

## Conflict Rule

Two intervals conflict unless one ends at or before the other starts.

- non-conflict: `newEnd <= existingStart`
- non-conflict: `newStart >= existingEnd`
- otherwise: conflict, return `409 SLOT_ALREADY_OCCUPIED`

## Validation And Errors

- Validation follows the contract constraints for string lengths, required fields, and numeric bounds.
- `PATCH {}` is valid and returns the current event type unchanged.
- Error responses use the contract shape:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

Error codes:

- `VALIDATION_ERROR`
- `EVENT_TYPE_NOT_FOUND`
- `BOOKING_NOT_FOUND`
- `EVENT_TYPE_HAS_BOOKINGS`
- `SLOT_ALREADY_OCCUPIED`

## Verification Scenarios

- Create, read, update, and delete an event type without bookings.
- Return `404` for missing event types and bookings.
- Return available slots for an existing event type on a date.
- Create a booking on a free slot.
- Return `409` for overlapping bookings across different event types.
- Return future bookings sorted by `startTime`.
- Return `400` when deleting an event type that has bookings.
