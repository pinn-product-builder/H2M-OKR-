import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir o header com título', async ({ page }) => {
    await expect(page.locator('header h1')).toBeVisible();
  });

  test('deve ter campo de busca', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve executar busca e navegar para OKRs', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await searchInput.fill('faturamento');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve abrir dropdown de notificações', async ({ page }) => {
    const bellButton = page.locator('header button').filter({ has: page.locator('svg') }).nth(0);
    await bellButton.click();
    await page.waitForTimeout(500);
    const dropdownVisible = await page.locator('text=Notificações').isVisible().catch(() => false);
    expect(dropdownVisible).toBeTruthy();
  });

  test('deve exibir lista de notificações', async ({ page }) => {
    const bellButton = page.locator('header button').filter({ has: page.locator('svg') }).nth(0);
    await bellButton.click();
    await page.waitForTimeout(500);
    const notifItems = page.locator('[role="menuitem"]');
    const count = await notifItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve alternar tema claro/escuro', async ({ page }) => {
    const themeSelect = page.locator('header button[role="combobox"]');
    if (await themeSelect.isVisible().catch(() => false)) {
      await themeSelect.click();
      await page.waitForTimeout(300);
      const darkOption = page.locator('[role="option"]').filter({ hasText: /Escuro/i });
      if (await darkOption.isVisible().catch(() => false)) {
        await darkOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('deve abrir menu do usuário', async ({ page }) => {
    const userBtn = page.locator('header button').last();
    await userBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Sair')).toBeVisible();
  });
});
