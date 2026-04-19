import { Badge, Card, Stack, Text, Title } from '@mantine/core';
import type { EventType } from '../../lib/api-types';

interface BookingSummaryProps {
  eventType: EventType;
  selectedDateLabel: string;
  selectedTimeLabel: string;
}

export function BookingSummary({ eventType, selectedDateLabel, selectedTimeLabel }: BookingSummaryProps) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="md">
        <Title order={2}>{eventType.name}</Title>
        <Text c="dimmed">{eventType.description}</Text>
        <Badge variant="light">{eventType.durationMinutes} мин</Badge>
        <div>
          <Text fw={600}>Выбранная дата</Text>
          <Text>{selectedDateLabel || 'Не выбрана'}</Text>
        </div>
        <div>
          <Text fw={600}>Выбранное время</Text>
          <Text>{selectedTimeLabel || 'Не выбрано'}</Text>
        </div>
      </Stack>
    </Card>
  );
}
