import { randomUUID } from 'node:crypto';

import type {
  AvailableSlot,
  Booking,
  BookingCreate,
  EventType,
  EventTypeCreate,
  EventTypeUpdate,
} from './types.js';
import { DomainError } from './types.js';
import { MemoryStore } from '../store/memory-store.js';

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 18;
const MILLISECONDS_IN_MINUTE = 60_000;

const parseIsoDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(400, 'VALIDATION_ERROR', 'Validation error');
  }

  return date;
};

const parsePlainDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new DomainError(400, 'VALIDATION_ERROR', 'Validation error');
  }

  return value;
};

const hasOverlap = (
  startTime: Date,
  endTime: Date,
  bookings: Booking[],
  ignoredBookingId?: string,
) => {
  return bookings.some((booking) => {
    if (booking.id === ignoredBookingId) {
      return false;
    }

    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    return !(endTime <= existingStart || startTime >= existingEnd);
  });
};

export class CalendarService {
  constructor(private readonly store: MemoryStore) {}

  listEventTypes() {
    return this.store.eventTypes;
  }

  createEventType(input: EventTypeCreate) {
    const eventType: EventType = {
      id: randomUUID(),
      ...input,
    };

    this.store.eventTypes.push(eventType);

    return eventType;
  }

  getEventType(id: string) {
    const eventType = this.store.eventTypes.find((item) => item.id === id);

    if (!eventType) {
      throw new DomainError(404, 'EVENT_TYPE_NOT_FOUND', 'Event type not found');
    }

    return eventType;
  }

  updateEventType(id: string, input: EventTypeUpdate) {
    const eventType = this.getEventType(id);

    Object.assign(eventType, input);

    return eventType;
  }

  deleteEventType(id: string) {
    const eventTypeIndex = this.store.eventTypes.findIndex((item) => item.id === id);

    if (eventTypeIndex === -1) {
      throw new DomainError(404, 'EVENT_TYPE_NOT_FOUND', 'Event type not found');
    }

    if (this.store.bookings.some((booking) => booking.eventTypeId === id)) {
      throw new DomainError(400, 'EVENT_TYPE_HAS_BOOKINGS', 'Event type has bookings');
    }

    this.store.eventTypes.splice(eventTypeIndex, 1);
  }

  listAvailableSlots(id: string, date: string) {
    const eventType = this.getEventType(id);
    const plainDate = parsePlainDate(date);
    const slots: AvailableSlot[] = [];
    const dayStart = new Date(`${plainDate}T${String(DAY_START_HOUR).padStart(2, '0')}:00:00.000Z`);
    const dayEnd = new Date(`${plainDate}T${String(DAY_END_HOUR).padStart(2, '0')}:00:00.000Z`);
    const slotDuration = eventType.durationMinutes * MILLISECONDS_IN_MINUTE;

    for (let start = dayStart.getTime(); start + slotDuration <= dayEnd.getTime(); start += slotDuration) {
      const startTime = new Date(start);
      const endTime = new Date(start + slotDuration);

      if (!hasOverlap(startTime, endTime, this.store.bookings)) {
        slots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      }
    }

    return slots;
  }

  listBookings(now = new Date()) {
    return this.store.bookings
      .filter((booking) => new Date(booking.startTime) > now)
      .sort((left, right) => left.startTime.localeCompare(right.startTime));
  }

  createBooking(input: BookingCreate) {
    const eventType = this.getEventType(input.eventTypeId);
    const startTime = parseIsoDateTime(input.startTime);
    const endTime = new Date(startTime.getTime() + eventType.durationMinutes * MILLISECONDS_IN_MINUTE);

    if (hasOverlap(startTime, endTime, this.store.bookings)) {
      throw new DomainError(409, 'SLOT_ALREADY_OCCUPIED', 'Slot already occupied');
    }

    const booking: Booking = {
      id: randomUUID(),
      eventTypeId: eventType.id,
      eventTypeName: eventType.name,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      guest: input.guest,
    };

    this.store.bookings.push(booking);

    return booking;
  }

  cancelBooking(id: string) {
    const bookingIndex = this.store.bookings.findIndex((item) => item.id === id);

    if (bookingIndex === -1) {
      throw new DomainError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }

    this.store.bookings.splice(bookingIndex, 1);
  }
}
