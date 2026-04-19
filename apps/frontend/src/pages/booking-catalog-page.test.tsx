import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router';
import { BookingCatalogPage } from './booking-catalog-page';

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
  },
}));

describe('BookingCatalogPage', () => {
  it('loads and renders event type cards', async () => {
    render(
      <MantineProvider>
        <MemoryRouter>
          <BookingCatalogPage />
        </MemoryRouter>
      </MantineProvider>,
    );

    expect(await screen.findByText('Intro call')).toBeInTheDocument();
    expect(screen.getByText('Discuss project goals')).toBeInTheDocument();
    expect(screen.getByText('30 мин')).toBeInTheDocument();
  });
});
