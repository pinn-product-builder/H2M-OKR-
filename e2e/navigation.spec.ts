import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve navegar para seção OKRs via sidebar', async ({ page }) => {
    await page.locator('aside button, nav button').filter({ hasText: /OKR/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve navegar para seção Data Source via sidebar', async ({ page }) => {
    await page.locator('aside button, nav button').filter({ hasText: /Data Source/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText(/Data Source/i);
  });

  test('deve navegar para seção Usuários via sidebar', async ({ page }) => {
    await page.locator('aside button, nav button').filter({ hasText: /Usu/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve navegar para seção Configurações via sidebar', async ({ page }) => {
    await page.locator('aside button, nav button').filter({ hasText: /Config/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText(/Config/i);
  });

  test('deve voltar ao Dashboard via sidebar', async ({ page }) => {
    await page.locator('aside button, nav button').filter({ hasText: /Config/i }).first().click();
    await page.waitForTimeout(500);
    await page.locator('aside button, nav button').filter({ hasText: /Dashboard/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });
});
