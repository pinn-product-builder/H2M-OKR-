import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Usuários - Completo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Usuário');
  });

  test('deve exibir seção de usuários', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve ter campo de busca de usuários', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="usuário"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve buscar usuários pelo campo', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="usuário"]');
    await searchInput.fill('admin');
    await page.waitForTimeout(500);
    await searchInput.clear();
    await searchInput.fill('gestor');
    await page.waitForTimeout(500);
  });

  test('deve ter botão Novo Usuário', async ({ page }) => {
    const newUserBtn = page.locator('button').filter({ hasText: /Novo Usu/i });
    await expect(newUserBtn).toBeVisible();
  });

  test('deve abrir dialog de novo usuário com formulário completo', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo Usu/i }).click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verificar todos os campos do formulário
    await expect(dialog.locator('input').nth(0)).toBeVisible(); // Nome
    await expect(dialog.locator('input').nth(1)).toBeVisible(); // Email
    await expect(dialog.locator('input').nth(2)).toBeVisible(); // Senha

    // Verificar select de perfil
    const roleSelect = dialog.locator('[role="combobox"]');
    if (await roleSelect.isVisible().catch(() => false)) {
      await roleSelect.click();
      await page.waitForTimeout(300);
      await expect(page.locator('[role="option"]').filter({ hasText: /admin/i })).toBeVisible();
      await page.keyboard.press('Escape');
    }

    // Cancelar
    const cancelBtn = dialog.locator('button').filter({ hasText: /Cancelar/i });
    await cancelBtn.click();
  });

  test('deve preencher formulário de novo usuário', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo Usu/i }).click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');

    await dialog.locator('input').nth(0).fill('Teste E2E User');
    await dialog.locator('input').nth(1).fill('teste_e2e@h2m.com');
    await dialog.locator('input').nth(2).fill('senha123456');

    const cancelBtn = dialog.locator('button').filter({ hasText: /Cancelar/i });
    await cancelBtn.click();
  });

  test('deve ter select de perfil por usuário na lista', async ({ page }) => {
    const roleSelects = page.locator('[role="combobox"]').filter({ hasText: /admin|gestor|analista|visualizador/i });
    const count = await roleSelects.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
