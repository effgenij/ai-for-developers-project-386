import { Navigate, createBrowserRouter } from 'react-router';
import { AdminLayout } from './layouts/admin-layout';
import { PublicLayout } from './layouts/public-layout';
import { HomePage } from '../pages/home-page';
import { BookingCatalogPage } from '../pages/booking-catalog-page';
import { BookingFlowPage } from '../pages/booking-flow-page';
import { AdminEventTypesPage } from '../pages/admin-event-types-page';
import { AdminBookingsPage } from '../pages/admin-bookings-page';

export const routes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'book', element: <BookingCatalogPage /> },
      { path: 'book/:eventTypeId', element: <BookingFlowPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/event-types" replace /> },
      { path: 'event-types', element: <AdminEventTypesPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
