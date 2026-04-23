import { expect, type APIRequestContext } from '@playwright/test';

interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
  endTime: string;
  guest: {
    name: string;
    email: string;
  };
}

export function buildFutureStartTime(daysAhead = 1, hour = 9, minute = 0) {
  const base = new Date();
  const target = new Date(Date.UTC(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    base.getUTCDate() + daysAhead,
    hour,
    minute,
    0,
    0,
  ));

  return target.toISOString();
}

export async function createEventType(request: APIRequestContext, suffix: string, durationMinutes = 30) {
  const response = await request.post('http://127.0.0.1:3000/api/event-types', {
    data: {
      name: `E2E ${suffix}`,
      description: `Prepared event type ${suffix}`,
      durationMinutes,
    },
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as EventType;
}

export async function createBooking(request: APIRequestContext, eventTypeId: string, startTime: string) {
  const response = await request.post('http://127.0.0.1:3000/api/bookings', {
    data: {
      eventTypeId,
      startTime,
      guest: {
        name: 'Occupied Slot Guest',
        email: 'occupied@example.com',
      },
    },
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as Booking;
}
