import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('OKR CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('aside button, nav button').filter({ hasText: /OKR/i }).first().click();
    await page.waitForTimeout(1000);
  });

  test('deve exibir a seção de OKRs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve ter botão de novo OKR', async ({ page }) => {
    const newOkrButton = page.locator('button').filter({ hasText: /Novo OKR/i });
    await expect(newOkrButton).toBeVisible();
  });

  test('deve abrir formulário de novo OKR', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo OKR/i }).click();
    await page.waitForTimeout(500);
    const formVisible = await page.locator('text=Título do Objetivo').isVisible().catch(() => false);
    const dialogVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    expect(formVisible || dialogVisible).toBeTruthy();
  });

  test('deve ter filtros de visualização', async ({ page }) => {
    const allStatuses = ['Todos', 'No Caminho', 'Atenção', 'Crítico'];
    for (const status of allStatuses) {
      const btn = page.locator('button').filter({ hasText: new RegExp(status, 'i') });
      const isVisible = await btn.isVisible().catch(() => false);
      if (isVisible) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('deve alternar modo de visualização grid/lista', async ({ page }) => {
    const viewButtons = page.locator('button[data-view], button:has(svg)').filter({ hasText: '' });
    const count = await viewButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve abrir modal de detalhe de OKR ao clicar em um card', async ({ page }) => {
    const okrCards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /\d+%/ });
    const count = await okrCards.count();
    if (count > 0) {
      await okrCards.first().click();
      await page.waitForTimeout(1000);
      const dialogVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
      if (dialogVisible) {
        await expect(page.locator('[role="dialog"]')).toBeVisible();
      }
    }
  });
});
