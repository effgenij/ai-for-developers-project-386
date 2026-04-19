import { Button, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { GuestInfo } from '../../lib/api-types';

interface GuestFormProps {
  initialValues: GuestInfo;
  submitting: boolean;
  onSubmit: (values: GuestInfo) => Promise<void>;
}

export function GuestForm({ initialValues, submitting, onSubmit }: GuestFormProps) {
  const form = useForm<GuestInfo>({
    mode: 'uncontrolled',
    initialValues,
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Введите имя' : null),
      email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Введите корректный email'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput label="Имя" key={form.key('name')} {...form.getInputProps('name')} />
        <TextInput label="Email" key={form.key('email')} {...form.getInputProps('email')} />
        <Button type="submit" loading={submitting}>Подтвердить</Button>
      </Stack>
    </form>
  );
}
