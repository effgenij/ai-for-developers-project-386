import { expect, test } from '@playwright/test';
import { buildFutureStartTime, createBooking, createEventType } from './helpers/api';

test('guest can complete booking from a prepared event type', async ({ page, request }) => {
  const eventType = await createEventType(request, 'Guest Happy Path', 30);

  await page.goto(`/book/${eventType.id}`);
  await expect(page.locator('h1')).toContainText(eventType.name);

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

  await page.getByLabel('Имя').fill('Иван Тестовый');
  await page.getByLabel('Email').fill('ivan@example.com');
  await page.getByRole('button', { name: 'Подтвердить' }).click();

  await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Иван Тестовый')).toBeVisible();
  await expect(page.getByText('ivan@example.com')).toBeVisible();
  await expect(page.locator('h2')).toContainText(eventType.name);
});

test('occupied slot is not offered to guest', async ({ page, request }) => {
  const eventType = await createEventType(request, 'Occupied Slot Test', 30);
  const occupiedStart = buildFutureStartTime(1, 9, 0);
  const occupiedDate = occupiedStart.slice(0, 10);

  await createBooking(request, eventType.id, occupiedStart);

  await page.goto(`/book/${eventType.id}`);
  await expect(page.locator('h1')).toContainText(eventType.name);

  const dayButton = page.getByRole('button', { name: new RegExp(occupiedDate.slice(5)) });
  if (await dayButton.isVisible()) {
    await dayButton.click();
  }

  const slots = page.locator('[data-slot-list] button');
  await expect(slots.first()).toBeVisible({ timeout: 10000 });

  const occupiedHour = occupiedStart.slice(11, 16);
  const slotTexts = await slots.allTextContents();
  for (const text of slotTexts) {
    expect(text).not.toContain(occupiedHour);
  }
});
