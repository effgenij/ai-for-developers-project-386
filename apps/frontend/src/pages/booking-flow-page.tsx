import { useEffect, useState } from 'react';
import { Alert, Button, Container, Grid, Group, Skeleton, Stack, Title } from '@mantine/core';
import { useParams } from 'react-router';
import { BookingSummary } from '../features/bookings/booking-summary';
import { SlotList } from '../features/bookings/slot-list';
import { api } from '../lib/api';
import type { AvailableSlot, EventType } from '../lib/api-types';
import { formatApiDate, formatDayLabel, formatLongDate, formatTimeRange, getBookingWindow } from '../lib/date';

export function BookingFlowPage() {
  const { eventTypeId = '' } = useParams();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => getBookingWindow()[0] ?? new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getEventType(eventTypeId),
      api.getAvailableSlots(eventTypeId, formatApiDate(selectedDate)),
    ])
      .then(([loadedEventType, loadedSlots]) => {
        setEventType(loadedEventType);
        setSlots(loadedSlots);
      })
      .catch(() => setError('Не удалось загрузить событие и слоты.'))
      .finally(() => setLoading(false));
  }, [eventTypeId, selectedDate]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Skeleton h={320} radius="lg" />
      </Container>
    );
  }

  if (!eventType) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red">Событие не найдено.</Alert>
      </Container>
    );
  }

  const windowDays = getBookingWindow();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>{eventType.name}</Title>
        {error ? <Alert color="red">{error}</Alert> : null}

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <BookingSummary
              eventType={eventType}
              selectedDateLabel={formatLongDate(selectedDate.toISOString())}
              selectedTimeLabel={selectedSlot ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime) : ''}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              <Title order={3}>Дни</Title>
              <Group wrap="wrap">
                {windowDays.map((day) => (
                  <Button
                    key={day.toISOString()}
                    variant={formatApiDate(day) === formatApiDate(selectedDate) ? 'filled' : 'light'}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedSlot(null);
                    }}
                  >
                    {formatDayLabel(day)}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              <Title order={3}>Слоты</Title>
              <SlotList
                slots={slots}
                selectedStartTime={selectedSlot?.startTime ?? null}
                onSelect={setSelectedSlot}
              />
              <Button disabled={!selectedSlot}>
                Продолжить
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
