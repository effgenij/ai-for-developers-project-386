import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { AdminEventTypesPage } from './admin-event-types-page';

vi.mock('../lib/api', () => ({
  api: {
    getEventTypes: vi.fn().mockResolvedValue([
      {
        id: 'intro-call',
        name: 'Intro call',
        description: 'Discuss project goals',
        durationMinutes: 30,
      },
    ]),
    createEventType: vi.fn().mockResolvedValue({
      id: 'deep-dive',
      name: 'Deep dive',
      description: 'Review implementation details',
      durationMinutes: 60,
    }),
    updateEventType: vi.fn(),
    deleteEventType: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AdminEventTypesPage', () => {
  it('opens the drawer and creates a new event type', async () => {
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <AdminEventTypesPage />
      </MantineProvider>,
    );

    expect(await screen.findByText('Intro call')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Новый тип события' }));
    await user.type(await screen.findByLabelText('Название'), 'Deep dive');
    await user.type(await screen.findByLabelText('Описание'), 'Review implementation details');
    await user.clear(await screen.findByLabelText('Длительность, минут'));
    await user.type(await screen.findByLabelText('Длительность, минут'), '60');
    await user.click(await screen.findByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Deep dive')).toBeInTheDocument();
  });
});
