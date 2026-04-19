import { describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('api client', () => {
  it('maps ApiError payloads into thrown Error objects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ code: 'slot_conflict', message: 'Slot already booked' }),
      }),
    );

    await expect(api.createBooking({
      eventTypeId: 'event-1',
      startTime: '2026-04-20T09:00:00Z',
      guest: { name: 'Ann', email: 'ann@example.com' },
    })).rejects.toMatchObject({
      code: 'slot_conflict',
      message: 'Slot already booked',
    });
  });
});
