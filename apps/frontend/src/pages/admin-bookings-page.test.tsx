import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { AdminBookingsPage } from './admin-bookings-page';

vi.mock('../lib/api', () => ({
  api: {
    getBookings: vi.fn().mockResolvedValue([
      {
        id: 'booking-1',
        eventTypeId: 'intro-call',
        eventTypeName: 'Intro call',
        startTime: '2026-04-20T09:00:00Z',
        endTime: '2026-04-20T09:30:00Z',
        guest: { name: 'Ann', email: 'ann@example.com' },
      },
    ]),
    cancelBooking: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AdminBookingsPage', () => {
  it('groups bookings by date and cancels a booking', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MantineProvider>
        <AdminBookingsPage />
      </MantineProvider>,
    );

    expect(await screen.findByText('Intro call')).toBeInTheDocument();
    expect(screen.getByText('Ann')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Отменить' }));

    expect(screen.queryByText('Ann')).not.toBeInTheDocument();
  });
});
