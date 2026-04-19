import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { BookingFlowPage } from './booking-flow-page';

const { createBooking } = vi.hoisted(() => ({
  createBooking: vi.fn(),
}));

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
    createBooking,
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

describe('BookingFlowPage guest step', () => {
  it('submits guest details and shows inline success state', async () => {
    const user = userEvent.setup();

    createBooking.mockResolvedValue({
      id: 'booking-1',
      eventTypeId: 'intro-call',
      eventTypeName: 'Intro call',
      startTime: '2026-04-20T09:00:00Z',
      endTime: '2026-04-20T09:30:00Z',
      guest: { name: 'Ann', email: 'ann@example.com' },
    });

    render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/book/intro-call']}>
          <Routes>
            <Route path="/book/:eventTypeId" element={<BookingFlowPage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>,
    );

    await user.click(await screen.findByRole('button', { name: '09:00 - 09:30' }));
    await user.click(await screen.findByRole('button', { name: 'Продолжить' }));
    await user.type(screen.getByLabelText('Имя'), 'Ann');
    await user.type(screen.getByLabelText('Email'), 'ann@example.com');
    await user.click(screen.getByRole('button', { name: 'Подтвердить' }));

    expect(await screen.findByText('Бронирование подтверждено')).toBeInTheDocument();
    expect(screen.getByText('ann@example.com')).toBeInTheDocument();
  });
});
