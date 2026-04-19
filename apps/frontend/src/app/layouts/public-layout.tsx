import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';
import { SiteHeader } from '../../components/site-header';

export function PublicLayout() {
  return (
    <AppShell header={{ height: 72 }} padding="md">
      <AppShell.Header>
        <SiteHeader />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
