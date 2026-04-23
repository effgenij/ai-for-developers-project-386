import { expect, test } from '@playwright/test';

test('admin creates event type, guest books it, admin sees booking', async ({ page }) => {
  await page.goto('/admin/event-types');
  await expect(page.getByRole('heading', { name: 'Типы событий' })).toBeVisible();

  await page.getByRole('button', { name: 'Новый тип события' }).click();

  const drawerTitle = page.getByRole('heading', { name: 'Новый тип события' });
  await expect(drawerTitle).toBeVisible();

  await page.getByLabel('Название').fill('Консультация E2E');
  await page.getByLabel('Описание').fill('E2E тестовая консультация');
  await page.getByLabel('Длительность, минут').fill('30');
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await expect(page.getByText('Консультация E2E').first()).toBeVisible({ timeout: 10000 });

  await page.goto('/book');
  await expect(page.getByRole('heading', { name: 'Выберите тип события' })).toBeVisible();

  await expect(page.getByText('Консультация E2E').first()).toBeVisible({ timeout: 10000 });
  const card = page.locator('.mantine-Card-root').filter({ hasText: 'Консультация E2E' }).first();
  await card.getByRole('link', { name: 'Выбрать' }).click();

  await expect(page.locator('h1')).toContainText('Консультация E2E');

  const dayButtons = page.locator('button').filter({ hasText: /^\d+ \w{3}$/ });
  const count = await dayButtons.count();
  let slotClicked = false;
  for (let i = 0; i < count && !slotClicked; i++) {
    await dayButtons.nth(i).click();
    const slots = page.locator('[data-slot-list] button');
    if (await slots.count() > 0) {
      await slots.first().click();
      slotClicked = true;
    }
  }
  expect(slotClicked).toBeTruthy();

  await page.getByRole('button', { name: 'Продолжить' }).click();

  await page.getByLabel('Имя').fill('Мария Админова');
  await page.getByLabel('Email').fill('maria@example.com');

  await page.getByRole('button', { name: 'Подтвердить' }).click();

  await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Мария Админова')).toBeVisible();

  await page.goto('/admin/bookings');
  await expect(page.getByRole('heading', { name: 'Предстоящие бронирования' })).toBeVisible();

  await expect(page.getByText('Консультация E2E').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Мария Админова')).toBeVisible();
  await expect(page.getByText('maria@example.com')).toBeVisible();
});
