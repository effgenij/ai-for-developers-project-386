import { Button, Drawer, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { EventType, EventTypeCreate } from '../../lib/api-types';

interface EventTypeFormDrawerProps {
  opened: boolean;
  initialValues?: EventType | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: EventTypeCreate) => Promise<void>;
}

export function EventTypeFormDrawer({ opened, initialValues, submitting, onClose, onSubmit }: EventTypeFormDrawerProps) {
  const form = useForm<EventTypeCreate>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      durationMinutes: initialValues?.durationMinutes || 30,
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Введите название' : null),
      description: (value) => (value.trim().length < 1 ? 'Введите описание' : null),
      durationMinutes: (value) => (value < 5 ? 'Минимум 5 минут' : null),
    },
  });

  return (
    <Drawer opened={opened} onClose={onClose} title={initialValues ? 'Редактировать тип события' : 'Новый тип события'} position="right">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput label="Название" key={form.key('name')} {...form.getInputProps('name')} />
          <Textarea label="Описание" key={form.key('description')} {...form.getInputProps('description')} />
          <NumberInput label="Длительность, минут" min={5} max={480} key={form.key('durationMinutes')} {...form.getInputProps('durationMinutes')} />
          <Button type="submit" loading={submitting}>Сохранить</Button>
        </Stack>
      </form>
    </Drawer>
  );
}
