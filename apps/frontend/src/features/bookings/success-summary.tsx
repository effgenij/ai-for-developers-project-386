import { Alert, Card, Stack, Text, Title } from '@mantine/core';
import type { Booking } from '../../lib/api-types';
import { formatLongDate, formatTimeRange } from '../../lib/date';

interface SuccessSummaryProps {
  booking: Booking;
}

export function SuccessSummary({ booking }: SuccessSummaryProps) {
  return (
    <Card withBorder radius="lg" padding="xl">
      <Stack>
        <Alert color="green" title="Готово">
          Бронирование подтверждено
        </Alert>
        <Title order={2}>{booking.eventTypeName}</Title>
        <Text>{formatLongDate(booking.startTime)}</Text>
        <Text>{formatTimeRange(booking.startTime, booking.endTime)}</Text>
        <Text>{booking.guest.name}</Text>
        <Text>{booking.guest.email}</Text>
      </Stack>
    </Card>
  );
}
