import Fastify, { type FastifyInstance } from 'fastify';

import { CalendarService } from './domain/calendar-service.js';
import { DomainError, type ApiError } from './domain/types.js';
import { MemoryStore } from './store/memory-store.js';

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
  },
} as const;

const eventTypeBodySchema = {
  type: 'object',
  required: ['name', 'description', 'durationMinutes'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    durationMinutes: { type: 'integer', minimum: 5, maximum: 480 },
  },
} as const;

const eventTypePatchSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    durationMinutes: { type: 'integer', minimum: 5, maximum: 480 },
  },
} as const;

const bookingBodySchema = {
  type: 'object',
  required: ['eventTypeId', 'startTime', 'guest'],
  additionalProperties: false,
  properties: {
    eventTypeId: { type: 'string' },
    startTime: { type: 'string', format: 'date-time' },
    guest: {
      type: 'object',
      required: ['name', 'email'],
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', minLength: 5, maxLength: 254 },
      },
    },
  },
} as const;

const slotsQuerySchema = {
  type: 'object',
  required: ['date'],
  additionalProperties: false,
  properties: {
    date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
  },
} as const;

const toApiError = (code: string, message: string): ApiError => ({ code, message });

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  const service = new CalendarService(new MemoryStore());

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof Error && 'validation' in error) {
      reply.status(400).send(toApiError('VALIDATION_ERROR', 'Validation error'));

      return;
    }

    if (error instanceof DomainError) {
      reply.status(error.statusCode).send(toApiError(error.code, error.message));

      return;
    }

    reply.send(error);
  });

  app.get('/api/health', async () => {
    return { status: 'ok' };
  });

  app.get('/api/event-types', async () => {
    return service.listEventTypes();
  });

  app.post('/api/event-types', { schema: { body: eventTypeBodySchema } }, async (request, reply) => {
    const eventType = service.createEventType(request.body as never);

    return reply.status(201).send(eventType);
  });

  app.get('/api/event-types/:id', { schema: { params: idParamsSchema } }, async (request) => {
    return service.getEventType((request.params as { id: string }).id);
  });

  app.patch(
    '/api/event-types/:id',
    { schema: { params: idParamsSchema, body: eventTypePatchSchema } },
    async (request) => {
      const { id } = request.params as { id: string };

      return service.updateEventType(id, request.body as never);
    },
  );

  app.delete('/api/event-types/:id', { schema: { params: idParamsSchema } }, async (request, reply) => {
    service.deleteEventType((request.params as { id: string }).id);

    return reply.status(204).send();
  });

  app.get(
    '/api/event-types/:id/available-slots',
    { schema: { params: idParamsSchema, querystring: slotsQuerySchema } },
    async (request) => {
      const { id } = request.params as { id: string };
      const { date } = request.query as { date: string };

      return service.listAvailableSlots(id, date);
    },
  );

  app.get('/api/bookings', async () => {
    return service.listBookings();
  });

  app.post('/api/bookings', { schema: { body: bookingBodySchema } }, async (request, reply) => {
    const booking = service.createBooking(request.body as never);

    return reply.status(201).send(booking);
  });

  app.delete('/api/bookings/:id', { schema: { params: idParamsSchema } }, async (request, reply) => {
    service.cancelBooking((request.params as { id: string }).id);

    return reply.status(204).send();
  });

  return app;
}
