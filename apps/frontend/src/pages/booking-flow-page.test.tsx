import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { BookingFlowPage } from './booking-flow-page';

vi.mock('../lib/api', () => ({
  api: {
    getEventType: vi.fn().mockResolvedValue({
      id: 'intro-call',
      name: 'Intro call',
      description: 'Discuss project goals',
      durationMinutes: 30,
    }),
    getAvailableSlots: vi.fn().mockResolvedValue([
      {
        startTime: '2026-04-20T06:00:00Z',
        endTime: '2026-04-20T06:30:00Z',
      },
    ]),
    createBooking: vi.fn(),
  },
}));

describe('BookingFlowPage slot step', () => {
  it('loads the event type and lets the guest choose a slot', async () => {
    const user = userEvent.setup();

    render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/book/intro-call']}>
          <Routes>
            <Route path="/book/:eventTypeId" element={<BookingFlowPage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>,
    );

    expect((await screen.findAllByText('Intro call')).length).toBeGreaterThan(0);
    const slotButton = await screen.findByRole('button', { name: '09:00 - 09:30' });
    await user.click(slotButton);

    expect(screen.getByText('Выбранное время')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Продолжить' })).toBeEnabled();
  });
});
