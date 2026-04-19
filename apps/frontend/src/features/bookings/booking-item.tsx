import { Button, Card, Group, Stack, Text } from '@mantine/core';
import type { Booking } from '../../lib/api-types';
import { formatTimeRange } from '../../lib/date';

interface BookingItemProps {
  booking: Booking;
  onCancel: () => void;
}

export function BookingItem({ booking, onCancel }: BookingItemProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text fw={600}>{booking.eventTypeName}</Text>
          <Text>{formatTimeRange(booking.startTime, booking.endTime)}</Text>
          <Text>{booking.guest.name}</Text>
          <Text c="dimmed">{booking.guest.email}</Text>
        </Stack>
        <Button color="red" variant="subtle" onClick={onCancel}>Отменить</Button>
      </Group>
    </Card>
  );
}
