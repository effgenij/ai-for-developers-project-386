import { Stack, Text, Title } from '@mantine/core';
import type { Booking } from '../../lib/api-types';
import { formatLongDate } from '../../lib/date';
import { BookingItem } from './booking-item';

interface BookingDateGroupProps {
  date: string;
  bookings: Booking[];
  onCancel: (id: string) => void;
}

export function BookingDateGroup({ date, bookings, onCancel }: BookingDateGroupProps) {
  return (
    <Stack gap="md">
      <Title order={3}>{formatLongDate(date)}</Title>
      {bookings.length === 0 ? <Text c="dimmed">На эту дату бронирований нет.</Text> : null}
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} onCancel={() => onCancel(booking.id)} />
      ))}
    </Stack>
  );
}
