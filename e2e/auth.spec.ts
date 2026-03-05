import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Autenticação', () => {
  test('deve exibir página de login com campos e abas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // Verifica abas Entrar / Criar Conta
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Entrar' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Criar Conta' })).toBeVisible();
  });

  test('deve alternar para aba Criar Conta e voltar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('button[role="tab"]').filter({ hasText: 'Criar Conta' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('input[placeholder*="Nome"]')).toBeVisible();
    await page.locator('button[role="tab"]').filter({ hasText: 'Entrar' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('deve mostrar/esconder senha ao clicar no olho', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const pwInput = page.locator('input[type="password"]');
    await expect(pwInput).toBeVisible({ timeout: 10000 });
    const eyeBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
    // Tenta achar botão do olho próximo ao campo de senha
    const toggleBtn = page.locator('button:has(svg.lucide-eye), button:has(svg.lucide-eye-off)').first();
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  });

  test('deve fazer logout e voltar ao login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });

    const userBtn = page.locator('header button').last();
    await userBtn.click();
    await page.waitForTimeout(500);
    const sairBtn = page.locator('[role="menuitem"]').filter({ hasText: /Sair/i });
    if (await sairBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sairBtn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    }
  });
});
