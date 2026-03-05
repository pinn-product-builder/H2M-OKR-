import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@h2m.com',
  password: '123456',
};

export async function login(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  }
}

export async function navigateToSection(page: Page, sectionName: string) {
  const sidebarButton = page.locator(`nav button, aside button, [role="button"]`).filter({ hasText: sectionName });
  await sidebarButton.first().click();
  await page.waitForTimeout(500);
}
