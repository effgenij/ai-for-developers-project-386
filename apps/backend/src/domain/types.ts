export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface GuestInfo {
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
  endTime: string;
  guest: GuestInfo;
}

export interface EventTypeCreate {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeUpdate {
  name?: string;
  description?: string;
  durationMinutes?: number;
}

export interface BookingCreate {
  eventTypeId: string;
  startTime: string;
  guest: GuestInfo;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export class DomainError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
