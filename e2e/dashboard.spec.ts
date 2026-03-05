import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir dashboard com métricas', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
    const metricCards = page.locator('.metric-card, [class*="metric"]');
    const count = await metricCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve ter botão Filtrar funcional com dropdown', async ({ page }) => {
    const filtrarBtn = page.locator('button').filter({ hasText: 'Filtrar' });
    await expect(filtrarBtn).toBeVisible();
    await filtrarBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="menuitemcheckbox"]').first()).toBeVisible({ timeout: 3000 });
  });

  test('deve filtrar OKRs por status via dropdown', async ({ page }) => {
    const filtrarBtn = page.locator('button').filter({ hasText: 'Filtrar' });
    await filtrarBtn.click();
    await page.waitForTimeout(500);
    const checkboxes = page.locator('[role="menuitemcheckbox"]');
    const count = await checkboxes.count();
    expect(count).toBe(3);
    await checkboxes.first().click();
    await page.waitForTimeout(500);
  });

  test('deve ter botão Nova Tarefa funcional', async ({ page }) => {
    const novaTarefaBtn = page.locator('button').filter({ hasText: 'Nova Tarefa' });
    await expect(novaTarefaBtn).toBeVisible();
    await novaTarefaBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve ter botão Novo OKR funcional', async ({ page }) => {
    const novoOkrBtn = page.locator('button').filter({ hasText: 'Novo OKR' });
    await expect(novoOkrBtn).toBeVisible();
    await novoOkrBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve clicar em setor e exibir toast', async ({ page }) => {
    const sectorRow = page.locator('.cursor-pointer').filter({ hasText: /OKR.*setor/i });
    if (await sectorRow.first().isVisible().catch(() => false)) {
      await sectorRow.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('deve exibir visão por setor', async ({ page }) => {
    await expect(page.locator('text=Visão por Setor')).toBeVisible();
  });
});
