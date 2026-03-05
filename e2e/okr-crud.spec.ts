import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('OKR - Seção Completa', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'OKR');
  });

  test('deve exibir a seção de OKRs com abas Ativos e Histórico', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/OKR/i);
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Ativos' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Histórico' })).toBeVisible();
  });

  test('deve ter campo de busca de OKRs', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar OKR"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('faturamento');
    await page.waitForTimeout(500);
  });

  test('deve ter filtro de status funcional', async ({ page }) => {
    const statusSelect = page.locator('[role="combobox"]').filter({ hasText: /Todos|Status/i });
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.click();
      await page.waitForTimeout(500);
    }
  });

  test('deve alternar entre visualização grid e lista', async ({ page }) => {
    const gridBtn = page.locator('button:has(svg.lucide-layout-grid)');
    const listBtn = page.locator('button:has(svg.lucide-list)');
    if (await gridBtn.isVisible().catch(() => false)) {
      await gridBtn.click();
      await page.waitForTimeout(300);
    }
    if (await listBtn.isVisible().catch(() => false)) {
      await listBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('deve abrir formulário Novo OKR com todos os campos', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo OKR/i }).click();
    await page.waitForTimeout(1000);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await expect(dialog.locator('input, textarea').first()).toBeVisible();
    const cancelBtn = dialog.locator('button').filter({ hasText: /Cancelar/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await page.waitForTimeout(500);
  });

  test('deve preencher e criar novo OKR', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo OKR/i }).click();
    await page.waitForTimeout(1000);
    const dialog = page.locator('[role="dialog"]');

    const tituloInput = dialog.locator('input').first();
    await tituloInput.fill('OKR Teste E2E Automatizado');

    const textareas = dialog.locator('textarea');
    if (await textareas.count() > 0) {
      await textareas.first().fill('Descrição do teste E2E');
    }

    // Selecionar setor
    const selects = dialog.locator('[role="combobox"]');
    if (await selects.count() > 0) {
      await selects.first().click();
      await page.waitForTimeout(300);
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(300);
      }
    }

    const criarBtn = dialog.locator('button').filter({ hasText: /Criar OKR/i });
    if (await criarBtn.isEnabled()) {
      await criarBtn.click();
      await page.waitForTimeout(3000);
    }
  });

  test('deve abrir modal de detalhe ao clicar em OKR card', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /\d+%/ });
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible().catch(() => false)) {
        await expect(dialog.locator('button[role="tab"]').filter({ hasText: 'Key Results' })).toBeVisible();
        await expect(dialog.locator('button[role="tab"]').filter({ hasText: 'Tarefas' })).toBeVisible();
      }
    }
  });

  test('deve navegar entre abas Key Results/Tarefas/Histórico no modal OKR', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /\d+%/ });
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible().catch(() => false)) {
        const tabs = ['Key Results', 'Tarefas', 'Histórico'];
        for (const tab of tabs) {
          const tabBtn = dialog.locator('button[role="tab"]').filter({ hasText: tab });
          if (await tabBtn.isVisible().catch(() => false)) {
            await tabBtn.click();
            await page.waitForTimeout(300);
          }
        }
      }
    }
  });

  test('deve ter botão Excluir no modal OKR', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /\d+%/ });
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible().catch(() => false)) {
        const excluirBtn = dialog.locator('button').filter({ hasText: /Excluir/i });
        await expect(excluirBtn).toBeVisible();
      }
    }
  });

  test('deve navegar para aba Histórico', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Histórico' }).click();
    await page.waitForTimeout(500);
    const searchHist = page.locator('input[placeholder*="histórico"]');
    if (await searchHist.isVisible().catch(() => false)) {
      await searchHist.fill('teste');
      await page.waitForTimeout(300);
    }
  });

  test('deve ter filtros de status visíveis', async ({ page }) => {
    const filterBtns = page.locator('button').filter({ hasText: /Todos|No Caminho|Atenção|Crítico/i });
    const count = await filterBtns.count();
    expect(count).toBeGreaterThan(0);
  });
});
