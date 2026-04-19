import { describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import { AppProviders } from './providers';
import { routes } from './router';

describe('router shell', () => {
  it('renders shared navigation on guest and admin routes', async () => {
    const guestRouter = createMemoryRouter(routes, {
      initialEntries: ['/book'],
    });

    render(
      <AppProviders>
        <RouterProvider router={guestRouter} />
      </AppProviders>,
    );

    expect(await screen.findByRole('link', { name: 'Записаться' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Админка' })).toBeInTheDocument();

    const adminRouter = createMemoryRouter(routes, {
      initialEntries: ['/admin/event-types'],
    });

    render(
      <AppProviders>
        <RouterProvider router={adminRouter} />
      </AppProviders>,
    );

    expect(await screen.findAllByRole('link', { name: 'Записаться' })).not.toHaveLength(0);
  });
});
