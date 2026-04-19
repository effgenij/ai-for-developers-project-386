import { Button, Card, Container, Grid, List, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

export function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Grid gutter="xl" align="flex-start">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <Text fw={700} c="blue">Быстрая запись на звонок</Text>
            <Title order={1}>Calendar</Title>
            <Text size="lg" c="dimmed">
              Забронируйте встречу за минуту: выберите тип события и удобное время.
            </Text>
            <Button component={Link} to="/book" size="md" radius="xl">
              Записаться
            </Button>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" padding="xl">
            <Title order={2} mb="md">Возможности</Title>
            <List spacing="sm">
              <List.Item>Выбор типа события и удобного времени встречи.</List.Item>
              <List.Item>Быстрое бронирование без регистрации.</List.Item>
              <List.Item>Админка для управления типами встреч и бронированиями.</List.Item>
            </List>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
