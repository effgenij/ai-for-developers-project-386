# Frontend UI Design

## Approach

Route-first React app with shared branding and separate guest/admin screens. UI built with Mantine components and patterns. All data access goes through a small API client so Prism and the real backend are interchangeable by config.

## Routes

| Route | Purpose |
|---|---|
| `/` | Public landing page with hero, short product summary, CTA button, and header nav |
| `/book` | Event type catalog for guests |
| `/book/:eventTypeId` | Booking wizard for a specific event type |
| `/admin/event-types` | Owner screen for managing event types |
| `/admin/bookings` | Owner screen for upcoming bookings |

## Layouts

- Shared top header with `Записаться` and `Админка` navigation links
- Public pages: lighter, more marketing/product-oriented
- Admin pages: same brand, denser and more operational
- Mobile: catalog in one column, wizard as vertical flow, admin cards/lists stack vertically, drawer near full-width

## Guest Flow

1. `/book` shows event type cards (name, description, duration)
2. Clicking a card navigates to `/book/:eventTypeId`
3. Booking wizard has three in-page steps:
   - **Step 1 — choose date/slot:** 14-day window experience; data fetched per day from `GET /api/event-types/:id/available-slots?date=`, but presented as a continuous view
   - **Step 2 — enter guest details:** form with name and email fields
   - **Step 3 — success state:** shown inside the same wizard with booking summary (date, time, event type, guest name, email)
4. If a day has no available slots, the user stays in the wizard and can try another day or switch to a different event type
5. On `409 Conflict` (slot already taken), show a clear message and ask the user to pick another slot without breaking the wizard

## Admin Flow

### Event Types (`/admin/event-types`)
- Display event types as cards with name, description, duration, and quick actions (edit, delete)
- Create and edit via right-side `Drawer` form
- Delete with confirmation
- Notifications for all mutations

### Bookings (`/admin/bookings`)
- Display bookings grouped by date, sorted by time within each group
- Each booking shows: time, event type name, guest name, guest email, cancel action
- Cancel with confirmation
- Empty state when no bookings exist

## Component Structure

### Layouts
- `PublicLayout` — header + container for `/`, `/book`, `/book/:eventTypeId`
- `AdminLayout` — header + container for `/admin/*`

### Route Screens
- `HomePage`
- `BookingCatalogPage`
- `BookingFlowPage`
- `AdminEventTypesPage`
- `AdminBookingsPage`

### Reusable UI Blocks
- `EventTypeCard` — card for catalog and admin list
- `SlotList` — list of available time slots for a date
- `BookingSummary` — summary of selected booking details
- `SuccessSummary` — confirmation block inside wizard after successful booking
- `BookingItem` — single booking row in admin list
- `BookingDateGroup` — date header + booking items for that date
- `EventTypeFormDrawer` — drawer with create/edit form for event types
- `GuestForm` — name + email form step in booking wizard

## State and Data Flow

- No global store (no Redux)
- State local to route screens
- Mantine form utilities for event type forms and guest form
- Wizard state managed within `BookingFlowPage`: selected event type, date, slot, guest form values, success result

### API Client
Single module exposing:
- `getEventTypes()` → `EventType[]`
- `getEventType(id)` → `EventType`
- `createEventType(data)` → `EventType`
- `updateEventType(id, data)` → `EventType`
- `deleteEventType(id)` → void
- `getAvailableSlots(eventTypeId, date)` → `AvailableSlot[]`
- `getBookings()` → `Booking[]`
- `createBooking(data)` → `Booking`
- `cancelBooking(id)` → void

Base URL determined by env/config. Screens never know whether data comes from Prism or backend.

## Dev Integration

- API source set via environment variable only (no UI toggle)
- Mock mode: frontend talks to Prism mock server
- Real mode: frontend talks to Fastify backend
- Same UI code for both modes
- Prism can optionally be used as a validation proxy against the real backend

## Responsive Behavior

Desktop and mobile are equal priority.

| Area | Desktop | Mobile |
|---|---|---|
| Catalog | multi-column card grid | single column |
| Booking wizard | side-by-day info + slots | vertical flow: summary → days → slots → form |
| Admin event types | card grid | single column |
| Admin bookings | grouped list with columns | stacked list |
| Drawer | ~400px side panel | near full-width |

## Loading, Empty, and Error States

- **Loading:** skeleton placeholders for cards, lists, and wizard sections
- **Empty states:** no event types, no bookings, no available slots
- **Validation:** inline errors on form fields (guest form and event type form)
- **Mutations:** toast notifications for create, update, delete, cancel
- **409 Conflict:** keep user in wizard, show message, ask to pick another slot
- **Network errors:** show retry option without resetting the current flow

## Testing Focus

- Route rendering and navigation
- Guest happy path: catalog → wizard → slot selection → form → success
- Admin CRUD happy paths: create, edit, delete event type; cancel booking
- Edge cases:
  - no available slots in 14-day window
  - load failures with retry
  - `409` booking conflict
  - booking cancellation
- Test user scenarios and state transitions, not Mantine internals
