import { useEffect, useState } from 'react';
import { Alert, Container, Grid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { api } from '../lib/api';
import type { EventType } from '../lib/api-types';
import { EventTypeCard } from '../features/event-types/event-type-card';

export function BookingCatalogPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getEventTypes()
      .then(setEventTypes)
      .catch(() => setError('Не удалось загрузить типы событий.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Выберите тип события</Title>
          <Text c="dimmed">Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.</Text>
        </div>

        {error ? <Alert color="red">{error}</Alert> : null}

        {loading ? (
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}><Skeleton h={180} radius="lg" /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Skeleton h={180} radius="lg" /></Grid.Col>
          </Grid>
        ) : null}

        {!loading && !error && eventTypes.length === 0 ? (
          <Alert color="blue">Пока нет доступных типов событий.</Alert>
        ) : null}

        <Grid>
          {eventTypes.map((eventType) => (
            <Grid.Col key={eventType.id} span={{ base: 12, md: 6 }}>
              <EventTypeCard
                eventType={eventType}
                actionLabel="Выбрать"
                actionTo={`/book/${eventType.id}`}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
