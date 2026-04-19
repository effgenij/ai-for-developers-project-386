import { useEffect, useState } from 'react';
import { Alert, Button, Container, Grid, Group, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { EventTypeCard } from '../features/event-types/event-type-card';
import { EventTypeFormDrawer } from '../features/event-types/event-type-form-drawer';
import { api } from '../lib/api';
import type { EventType, EventTypeCreate } from '../lib/api-types';

export function AdminEventTypesPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getEventTypes().then(setEventTypes).catch(() => setError('Не удалось загрузить типы событий.'));
  }, []);

  async function handleSubmit(values: EventTypeCreate) {
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await api.updateEventType(editing.id, values);
        setEventTypes((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        notifications.show({ color: 'green', message: 'Тип события обновлен' });
      } else {
        const created = await api.createEventType(values);
        setEventTypes((current) => [...current, created]);
        notifications.show({ color: 'green', message: 'Тип события создан' });
      }

      setEditing(null);
      close();
    } catch {
      notifications.show({ color: 'red', message: 'Не удалось сохранить тип события' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Удалить тип события?')) return;
    await api.deleteEventType(id);
    setEventTypes((current) => current.filter((item) => item.id !== id));
    notifications.show({ color: 'green', message: 'Тип события удален' });
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Типы событий</Title>
          <Button onClick={() => { setEditing(null); open(); }}>Новый тип события</Button>
        </Group>

        {error ? <Alert color="red">{error}</Alert> : null}

        <Grid>
          {eventTypes.map((eventType) => (
            <Grid.Col key={eventType.id} span={{ base: 12, md: 6 }}>
              <EventTypeCard
                eventType={eventType}
                onEdit={() => { setEditing(eventType); open(); }}
                onDelete={() => handleDelete(eventType.id)}
              />
            </Grid.Col>
          ))}
        </Grid>

        <EventTypeFormDrawer
          opened={opened}
          initialValues={editing}
          submitting={submitting}
          onClose={() => { setEditing(null); close(); }}
          onSubmit={handleSubmit}
        />
      </Stack>
    </Container>
  );
}
