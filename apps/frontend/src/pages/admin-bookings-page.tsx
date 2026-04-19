import { useEffect, useMemo, useState } from 'react';
import { Alert, Container, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BookingDateGroup } from '../features/bookings/booking-date-group';
import { api } from '../lib/api';
import type { Booking } from '../lib/api-types';
import { groupBookingsByDate } from '../lib/date';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getBookings().then(setBookings).catch(() => setError('Не удалось загрузить бронирования.'));
  }, []);

  const grouped = useMemo(() => groupBookingsByDate(bookings), [bookings]);

  async function handleCancel(id: string) {
    if (!window.confirm('Отменить бронирование?')) return;

    try {
      await api.cancelBooking(id);
      setBookings((current) => current.filter((item) => item.id !== id));
      notifications.show({ color: 'green', message: 'Бронирование отменено' });
    } catch {
      notifications.show({ color: 'red', message: 'Не удалось отменить бронирование' });
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Предстоящие бронирования</Title>
        {error ? <Alert color="red">{error}</Alert> : null}
        {Object.keys(grouped).length === 0 && !error ? <Alert color="blue">Предстоящих бронирований пока нет.</Alert> : null}
        {Object.entries(grouped).map(([date, items]) => (
          <BookingDateGroup key={date} date={date} bookings={items} onCancel={handleCancel} />
        ))}
      </Stack>
    </Container>
  );
}
