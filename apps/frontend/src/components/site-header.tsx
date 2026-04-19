import { Anchor, Container, Group, Text } from '@mantine/core';
import { Link, NavLink } from 'react-router';

export function SiteHeader() {
  return (
    <Container size="lg" h="100%">
      <Group h="100%" justify="space-between">
        <Anchor component={Link} to="/" underline="never">
          <Text fw={700} size="xl">
            Calendar
          </Text>
        </Anchor>

        <Group gap="md">
          <Anchor component={NavLink} to="/book" underline="never">
            Записаться
          </Anchor>
          <Anchor component={NavLink} to="/admin/event-types" underline="never">
            Админка
          </Anchor>
        </Group>
      </Group>
    </Container>
  );
}
