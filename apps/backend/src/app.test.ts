import test from 'node:test';
import assert from 'node:assert/strict';

import { buildApp } from './app.js';

interface TestResponse {
  statusCode: number;
  json(): any;
}

const send = async (
  app: ReturnType<typeof buildApp>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  payload?: unknown,
): Promise<TestResponse> => {
  const response = await app.inject({
    method,
    url,
    payload: payload as Record<string, unknown> | undefined,
  });

  return response as TestResponse;
};

test('GET /api/event-types returns an empty list by default', async () => {
  const app = buildApp();

  const response = await send(app, 'GET', '/api/event-types');

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), []);

  await app.close();
});

test('event types support create read update and delete', async () => {
  const app = buildApp();

  const createResponse = await send(app, 'POST', '/api/event-types', {
    name: 'Intro call',
    description: 'First meeting',
    durationMinutes: 30,
  });

  assert.equal(createResponse.statusCode, 201);
  const createdEventType = createResponse.json();
  assert.equal(createdEventType.name, 'Intro call');
  assert.equal(createdEventType.description, 'First meeting');
  assert.equal(createdEventType.durationMinutes, 30);
  assert.ok(typeof createdEventType.id === 'string');

  const listResponse = await send(app, 'GET', '/api/event-types');
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().length, 1);

  const readResponse = await send(app, 'GET', `/api/event-types/${createdEventType.id}`);
  assert.equal(readResponse.statusCode, 200);
  assert.deepEqual(readResponse.json(), createdEventType);

  const updateResponse = await send(app, 'PATCH', `/api/event-types/${createdEventType.id}`, {
    description: 'Updated description',
    durationMinutes: 45,
  });

  assert.equal(updateResponse.statusCode, 200);
  assert.equal(updateResponse.json().description, 'Updated description');
  assert.equal(updateResponse.json().durationMinutes, 45);

  const deleteResponse = await send(app, 'DELETE', `/api/event-types/${createdEventType.id}`);
  assert.equal(deleteResponse.statusCode, 204);

  const afterDeleteResponse = await send(app, 'GET', '/api/event-types');
  assert.deepEqual(afterDeleteResponse.json(), []);

  await app.close();
});

test('missing event type operations return 404', async () => {
  const app = buildApp();

  for (const method of ['GET', 'PATCH', 'DELETE'] as const) {
    const response = await send(app, method, '/api/event-types/missing',
      method === 'PATCH'
        ? {
            name: 'Changed',
          }
        : undefined,
    );

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {
      code: 'EVENT_TYPE_NOT_FOUND',
      message: 'Event type not found',
    });
  }

  await app.close();
});

test('available slots are generated for the event type duration and skip occupied times', async () => {
  const app = buildApp();

  const consultationResponse = await send(app, 'POST', '/api/event-types', {
    name: 'Consultation',
    description: 'Half-hour booking',
    durationMinutes: 30,
  });

  const workshopResponse = await send(app, 'POST', '/api/event-types', {
    name: 'Workshop',
    description: 'Longer event',
    durationMinutes: 60,
  });

  const consultation = consultationResponse.json();
  const workshop = workshopResponse.json();

  const createBookingResponse = await send(app, 'POST', '/api/bookings', {
    eventTypeId: workshop.id,
    startTime: '2099-01-01T10:00:00.000Z',
    guest: {
      name: 'Alex',
      email: 'alex@example.com',
    },
  });

  assert.equal(createBookingResponse.statusCode, 201);

  const slotsResponse = await send(
    app,
    'GET',
    `/api/event-types/${consultation.id}/available-slots?date=2099-01-01`,
  );

  assert.equal(slotsResponse.statusCode, 200);
  assert.deepEqual(slotsResponse.json().slice(0, 4), [
    {
      startTime: '2099-01-01T09:00:00.000Z',
      endTime: '2099-01-01T09:30:00.000Z',
    },
    {
      startTime: '2099-01-01T09:30:00.000Z',
      endTime: '2099-01-01T10:00:00.000Z',
    },
    {
      startTime: '2099-01-01T11:00:00.000Z',
      endTime: '2099-01-01T11:30:00.000Z',
    },
    {
      startTime: '2099-01-01T11:30:00.000Z',
      endTime: '2099-01-01T12:00:00.000Z',
    },
  ]);

  assert.equal(
    slotsResponse
      .json()
      .some((slot: { startTime: string; endTime: string }) => slot.startTime === '2099-01-01T10:00:00.000Z'),
    false,
  );
  assert.equal(
    slotsResponse
      .json()
      .some((slot: { startTime: string; endTime: string }) => slot.startTime === '2099-01-01T10:30:00.000Z'),
    false,
  );

  await app.close();
});

test('bookings are created listed and cancelled and overlapping bookings are rejected', async () => {
  const app = buildApp();

  const introResponse = await send(app, 'POST', '/api/event-types', {
    name: 'Intro',
    description: 'Short call',
    durationMinutes: 30,
  });
  const demoResponse = await send(app, 'POST', '/api/event-types', {
    name: 'Demo',
    description: 'Product demo',
    durationMinutes: 30,
  });

  const intro = introResponse.json();
  const demo = demoResponse.json();

  const createBookingResponse = await send(app, 'POST', '/api/bookings', {
    eventTypeId: intro.id,
    startTime: '2099-05-01T12:00:00.000Z',
    guest: {
      name: 'Jamie',
      email: 'jamie@example.com',
    },
  });

  assert.equal(createBookingResponse.statusCode, 201);
  assert.deepEqual(createBookingResponse.json().guest, {
    name: 'Jamie',
    email: 'jamie@example.com',
  });
  assert.equal(createBookingResponse.json().eventTypeName, 'Intro');
  assert.equal(createBookingResponse.json().endTime, '2099-05-01T12:30:00.000Z');

  const conflictResponse = await send(app, 'POST', '/api/bookings', {
    eventTypeId: demo.id,
    startTime: '2099-05-01T12:15:00.000Z',
    guest: {
      name: 'Taylor',
      email: 'taylor@example.com',
    },
  });

  assert.equal(conflictResponse.statusCode, 409);
  assert.deepEqual(conflictResponse.json(), {
    code: 'SLOT_ALREADY_OCCUPIED',
    message: 'Slot already occupied',
  });

  const bookingsResponse = await send(app, 'GET', '/api/bookings');
  assert.equal(bookingsResponse.statusCode, 200);
  assert.equal(bookingsResponse.json().length, 1);
  assert.equal(bookingsResponse.json()[0].startTime, '2099-05-01T12:00:00.000Z');

  const protectedDeleteResponse = await send(app, 'DELETE', `/api/event-types/${intro.id}`);
  assert.equal(protectedDeleteResponse.statusCode, 400);
  assert.deepEqual(protectedDeleteResponse.json(), {
    code: 'EVENT_TYPE_HAS_BOOKINGS',
    message: 'Event type has bookings',
  });

  const cancelResponse = await send(app, 'DELETE', `/api/bookings/${createBookingResponse.json().id}`);
  assert.equal(cancelResponse.statusCode, 204);

  const missingCancelResponse = await send(app, 'DELETE', `/api/bookings/${createBookingResponse.json().id}`);
  assert.equal(missingCancelResponse.statusCode, 404);
  assert.deepEqual(missingCancelResponse.json(), {
    code: 'BOOKING_NOT_FOUND',
    message: 'Booking not found',
  });

  const deleteEventTypeResponse = await send(app, 'DELETE', `/api/event-types/${intro.id}`);
  assert.equal(deleteEventTypeResponse.statusCode, 204);

  await app.close();
});
