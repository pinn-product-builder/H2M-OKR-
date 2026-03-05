import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Usuários', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('aside button, nav button').filter({ hasText: /Usu/i }).first().click();
    await page.waitForTimeout(1000);
  });

  test('deve exibir seção de usuários', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve ter campo de busca de usuários', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve ter botão de novo usuário', async ({ page }) => {
    const newUserBtn = page.locator('button').filter({ hasText: /Novo Usu/i });
    await expect(newUserBtn).toBeVisible();
  });

  test('deve abrir dialog de novo usuário', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo Usu/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('deve buscar usuários', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('admin');
    await page.waitForTimeout(500);
  });
});
