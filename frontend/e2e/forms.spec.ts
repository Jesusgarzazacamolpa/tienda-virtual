import { expect, test } from '@playwright/test';

import { loginThroughApi, seedSession } from './support/session';

test.describe('Ejemplos de formularios', () => {
  test.beforeEach(async ({ page, request }) => {
    const session = await loginThroughApi(request);
    await seedSession(page, session);
    await page.goto('/forms');
    await expect(page.getByRole('heading', { name: 'Ejemplos de formularios', level: 1 })).toBeVisible();
  });

  test('muestra los cinco patrones de formulario', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Alta de cliente' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Invitación de usuario' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preferencias de notificación' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carga de información' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Diálogo de confirmación' })).toBeVisible();
  });

  test('autocompleta el alta con SmartSearch y patchValue', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: 'Alta de cliente' });
    const search = card.getByRole('textbox', { name: 'Buscar empresa, contacto o correo' });

    await search.fill('acme');

    const result = card.getByRole('button', { name: /Acme Soluciones/ });
    await expect(result).toBeVisible();
    await result.click();

    await expect(card.getByRole('textbox', { name: 'Empresa', exact: true })).toHaveValue('Acme Soluciones');
    await expect(card.getByRole('textbox', { name: 'Contacto', exact: true })).toHaveValue('Ana López');
    await expect(card.getByLabel('Correo corporativo')).toHaveValue('ana@acme.com');
    await expect(card.getByLabel('Industria')).toHaveValue('technology');
  });

  test('valida y registra un cliente en modo demo', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: 'Alta de cliente' });

    await card.getByRole('textbox', { name: 'Empresa', exact: true }).fill('Acme');
    await card.getByRole('textbox', { name: 'Contacto', exact: true }).fill('Ana López');
    await card.getByLabel('Correo corporativo').fill('ana@acme.com');
    await card.getByLabel('Teléfono').fill('5551234567');
    await card.getByLabel('Empleados').fill('25');
    await card.getByLabel('Industria').selectOption('technology');

    await card.getByLabel('Ejecutivo de cuenta').click();
    await card.getByRole('option', { name: /Luis Ramírez/ }).click();

    await card.getByRole('button', { name: 'Registrar cliente' }).click();

    await expect(card.getByRole('status')).toContainText('Cliente listo para enviar');
    await expect(card.getByRole('status')).toContainText('Acme');
    await expect(card.getByRole('status')).toContainText('Tecnología');
    await expect(card.getByRole('status')).toContainText('Luis Ramírez');
  });

  test('simula la carga de accesos con skeleton', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: 'Carga de información' });

    await expect(card.getByText('Hace 5 min')).toBeVisible();
    await card.getByRole('button', { name: 'Simular carga' }).click();

    await expect(card.getByRole('button', { name: 'Cargando…' })).toBeVisible();
    await expect(card.getByText('Hace 5 min')).toBeHidden();

    await expect(card.getByText('Hace 5 min')).toBeVisible();
  });

  test('confirma una acción destructiva en el diálogo genérico', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: 'Diálogo de confirmación' });
    const dialog = page.getByRole('dialog', { name: '¿Eliminar la plantilla?' });

    await card.getByRole('button', { name: 'Eliminar plantilla' }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Esta acción no se puede deshacer.');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await card.getByRole('button', { name: 'Eliminar plantilla' }).click();
    await dialog.getByRole('button', { name: 'Eliminar plantilla' }).click();

    await expect(dialog).toBeHidden();
    await expect(card.getByRole('status')).toContainText('Plantilla eliminada (simulación)');
  });
});
