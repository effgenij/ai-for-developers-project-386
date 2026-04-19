import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import type { EventType } from '../../lib/api-types';

interface EventTypeCardProps {
  eventType: EventType;
  actionLabel?: string;
  actionTo?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EventTypeCard({ eventType, actionLabel, actionTo, onEdit, onDelete }: EventTypeCardProps) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{eventType.name}</Title>
            <Text c="dimmed">{eventType.description}</Text>
          </div>
          <Badge variant="light">{eventType.durationMinutes} мин</Badge>
        </Group>

        <Group>
          {actionLabel && actionTo ? (
            <Button component={Link} to={actionTo}>
              {actionLabel}
            </Button>
          ) : null}
          {onEdit ? <Button variant="light" onClick={onEdit}>Редактировать</Button> : null}
          {onDelete ? <Button color="red" variant="subtle" onClick={onDelete}>Удалить</Button> : null}
        </Group>
      </Stack>
    </Card>
  );
}
