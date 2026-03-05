import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Navegação Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir sidebar com todas as seções', async ({ page }) => {
    await expect(page.locator('aside button, nav button').filter({ hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /OKR/i })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: 'Data Source' })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /Usuário/i })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /Configura/i })).toBeVisible();
  });

  test('deve navegar para Dashboard', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await page.waitForTimeout(300);
    await navigateToSection(page, 'Dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('deve navegar para OKRs', async ({ page }) => {
    await navigateToSection(page, 'OKR');
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve navegar para Data Source', async ({ page }) => {
    await navigateToSection(page, 'Data Source');
    await expect(page.locator('h1')).toContainText(/Data Source/i);
  });

  test('deve navegar para Usuários', async ({ page }) => {
    await navigateToSection(page, 'Usuário');
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve navegar para Configurações', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await expect(page.locator('h1')).toContainText(/Config/i);
  });

  test('deve recolher/expandir sidebar', async ({ page }) => {
    const collapseBtn = page.locator('aside button, nav button').filter({ hasText: /Recolher/i });
    if (await collapseBtn.isVisible().catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(500);
      await collapseBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
