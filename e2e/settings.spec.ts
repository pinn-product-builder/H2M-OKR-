import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Configurações', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('aside button, nav button').filter({ hasText: /Config/i }).first().click();
    await page.waitForTimeout(500);
  });

  test('deve exibir abas de configuração', async ({ page }) => {
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Geral' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Integração' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Notificações' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Segurança' })).toBeVisible();
  });

  test('deve salvar alterações da aba Geral', async ({ page }) => {
    await expect(page.locator('input').first()).toBeVisible();
    await page.locator('button').filter({ hasText: 'Salvar Alterações' }).click();
    await expect(page.locator('text=Configurações salvas')).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar para aba Integração e salvar', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Salvar Configurações' }).click();
    await expect(page.locator('text=Configurações salvas')).toBeVisible({ timeout: 5000 });
  });

  test('deve baixar template de importação', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button').filter({ hasText: 'Faturamento' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('template_faturamento');
  });

  test('deve alternar switches de notificação', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Notificações' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(5);

    await switches.first().click();
    await expect(page.locator('text=Notificação')).toBeVisible({ timeout: 3000 });
  });

  test('deve alternar switches de segurança', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await switches.first().click();
    await expect(page.locator('text=Segurança atualizada')).toBeVisible({ timeout: 3000 });
  });
});
