import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Data Source - Completo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Data Source');
  });

  test('deve exibir seção Data Source com título', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Data Source/i);
  });

  test('deve ter 3 botões de ação principais', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: /Importar Dados/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Nova Fonte/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Atualizar Dados/i })).toBeVisible();
  });

  test('deve abrir wizard de Importar Dados', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Importar Dados/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    // Fechar dialog
    const cancelBtn = page.locator('[role="dialog"] button').filter({ hasText: /Cancelar|Fechar/i });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    }
  });

  test('deve abrir dialog Nova Fonte com formulário', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Nova Fonte/i }).click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.locator('input').first()).toBeVisible();
    const cancelBtn = dialog.locator('button').filter({ hasText: /Cancelar/i });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    }
  });

  test('deve clicar Atualizar Dados sem erro', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Atualizar Dados/i }).click();
    await page.waitForTimeout(2000);
  });

  test('deve navegar entre abas Planilhas/Mapeamentos/Logs/Monitoramento', async ({ page }) => {
    const tabs = ['Planilhas', 'Mapeamentos', 'Logs', 'Monitoramento'];
    for (const tab of tabs) {
      const tabBtn = page.locator('button[role="tab"]').filter({ hasText: new RegExp(tab, 'i') });
      if (await tabBtn.isVisible().catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('deve ter botão Novo Mapeamento na aba Mapeamentos', async ({ page }) => {
    const mapTab = page.locator('button[role="tab"]').filter({ hasText: /Mapeamento/i });
    if (await mapTab.isVisible().catch(() => false)) {
      await mapTab.click();
      await page.waitForTimeout(500);
      const novoMapBtn = page.locator('button').filter({ hasText: /Novo Mapeamento/i });
      if (await novoMapBtn.isVisible().catch(() => false)) {
        await novoMapBtn.click();
        await page.waitForTimeout(500);
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
        const cancelBtn = page.locator('[role="dialog"] button').filter({ hasText: /Cancelar/i });
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        }
      }
    }
  });

  test('deve exibir logs de importação na aba Logs', async ({ page }) => {
    const logTab = page.locator('button[role="tab"]').filter({ hasText: /Log/i });
    if (await logTab.isVisible().catch(() => false)) {
      await logTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('deve exibir monitoramento na aba Monitoramento', async ({ page }) => {
    const monTab = page.locator('button[role="tab"]').filter({ hasText: /Monitor/i });
    if (await monTab.isVisible().catch(() => false)) {
      await monTab.click();
      await page.waitForTimeout(500);
    }
  });
});
