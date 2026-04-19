import { Button, Stack, Text } from '@mantine/core';
import type { AvailableSlot } from '../../lib/api-types';
import { formatTimeRange } from '../../lib/date';

interface SlotListProps {
  slots: AvailableSlot[];
  selectedStartTime: string | null;
  onSelect: (slot: AvailableSlot) => void;
}

export function SlotList({ slots, selectedStartTime, onSelect }: SlotListProps) {
  if (slots.length === 0) {
    return <Text c="dimmed">На этот день свободных слотов нет.</Text>;
  }

  return (
    <Stack>
      {slots.map((slot) => (
        <Button
          key={slot.startTime}
          variant={selectedStartTime === slot.startTime ? 'filled' : 'light'}
          onClick={() => onSelect(slot)}
        >
          {formatTimeRange(slot.startTime, slot.endTime)}
        </Button>
      ))}
    </Stack>
  );
}
