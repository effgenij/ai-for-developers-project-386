import type { Booking, EventType } from '../domain/types.js';

export class MemoryStore {
  public eventTypes: EventType[] = [];

  public bookings: Booking[] = [];
}
