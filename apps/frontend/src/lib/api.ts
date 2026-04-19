import { getApiBaseUrl } from './config';
import type {
  ApiErrorPayload,
  AvailableSlot,
  Booking,
  BookingCreate,
  EventType,
  EventTypeCreate,
  EventTypeUpdate,
} from './api-types';

export class ApiClientError extends Error {
  code: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.code = payload.code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiErrorPayload;
    throw new ApiClientError(error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  getEventTypes: () => request<EventType[]>('/api/event-types'),
  getEventType: (id: string) => request<EventType>(`/api/event-types/${id}`),
  createEventType: (body: EventTypeCreate) =>
    request<EventType>('/api/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateEventType: (id: string, body: EventTypeUpdate) =>
    request<EventType>(`/api/event-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteEventType: (id: string) =>
    request<void>(`/api/event-types/${id}`, { method: 'DELETE' }),
  getAvailableSlots: (eventTypeId: string, date: string) =>
    request<AvailableSlot[]>(`/api/event-types/${eventTypeId}/available-slots?date=${date}`),
  getBookings: () => request<Booking[]>('/api/bookings'),
  createBooking: (body: BookingCreate) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  cancelBooking: (id: string) =>
    request<void>(`/api/bookings/${id}`, { method: 'DELETE' }),
};
