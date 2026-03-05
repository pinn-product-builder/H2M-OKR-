import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Autenticação', () => {
  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve rejeitar credenciais inválidas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill('wrong@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    const dashboardVisible = await page.locator('text=Dashboard').isVisible().catch(() => false);
    expect(dashboardVisible).toBeFalsy();
  });

  test('deve fazer login com credenciais válidas e redirecionar ao dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 15000 });
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 15000 });

    // Open user dropdown and click logout
    const userButton = page.locator('header button').last();
    await userButton.click();
    await page.locator('text=Sair').click();
    await page.waitForTimeout(2000);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
  });
});
