import { expect, test } from '@playwright/test';

import { ADMIN, loginThroughApi, seedSession, uniqueEmail } from './support/session';

test.describe('Gestión de usuarios', () => {
  test.beforeEach(async ({ page, request }) => {
    const session = await loginThroughApi(request);
    await seedSession(page, session);
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeVisible();
  });

  test('crea, busca, edita y cambia el estado de un usuario', async ({ page }) => {
    const email = uniqueEmail('e2e.crud');
    const panel = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await expect(panel.getByRole('heading', { name: 'Nuevo usuario' })).toBeVisible();

    await panel.getByLabel('Nombre').fill('E2E');
    await panel.getByLabel('Apellido').fill('Prueba');
    await panel.getByLabel('Correo').fill(email);
    await panel.getByLabel('Contraseña inicial').fill('Secret123!');

    const created = page.waitForResponse(
      response => response.url().endsWith('/api/v1/users') && response.request().method() === 'POST'
    );
    await panel.getByRole('button', { name: 'Crear usuario' }).click();
    expect((await created).status()).toBe(201);

    const search = page.getByRole('textbox', { name: 'Buscar por nombre, apellido o correo' });
    await search.fill(email);

    const row = page.getByRole('row').filter({ hasText: email });
    await expect(row).toBeVisible();
    await expect(row).toContainText('E2E Prueba');
    await expect(row).toContainText('USER');

    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(panel.getByRole('heading', { name: 'Editar usuario' })).toBeVisible();
    const lastName = panel.getByLabel('Apellido');
    await expect(lastName).toHaveValue('Prueba');
    await lastName.fill('Editado');

    const updated = page.waitForResponse(
      response => response.url().includes('/api/v1/users/') && response.request().method() === 'PUT'
    );
    await panel.getByRole('button', { name: 'Guardar cambios' }).click();
    expect((await updated).status()).toBe(200);
    await expect(row).toContainText('E2E Editado');

    const disabled = page.waitForResponse(
      response => response.url().endsWith('/status') && response.request().method() === 'PATCH'
    );
    await row.getByRole('button', { name: 'Desactivar' }).click();
    expect((await disabled).status()).toBe(200);
    await expect(row).toContainText('Inactivo');
    await expect(row.getByRole('button', { name: 'Activar' })).toBeVisible();

    const enabled = page.waitForResponse(
      response => response.url().endsWith('/status') && response.request().method() === 'PATCH'
    );
    await row.getByRole('button', { name: 'Activar' }).click();
    expect((await enabled).status()).toBe(200);
    await expect(row).toContainText('Activo');

    const cleanup = page.waitForResponse(
      response => response.url().endsWith('/status') && response.request().method() === 'PATCH'
    );
    await row.getByRole('button', { name: 'Desactivar' }).click();
    expect((await cleanup).status()).toBe(200);
    await expect(row).toContainText('Inactivo');
  });

  test('muestra el error del backend al duplicar un correo', async ({ page }) => {
    const panel = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await panel.getByLabel('Nombre').fill('Duplicado');
    await panel.getByLabel('Correo').fill(ADMIN.email);
    await panel.getByLabel('Contraseña inicial').fill('Secret123!');

    const conflict = page.waitForResponse(
      response => response.url().endsWith('/api/v1/users') && response.request().method() === 'POST'
    );
    await panel.getByRole('button', { name: 'Crear usuario' }).click();
    expect((await conflict).status()).toBe(409);

    await expect(panel.getByRole('alert')).toContainText('Ya existe un usuario con ese email.');
    await expect(panel.getByRole('heading', { name: 'Nuevo usuario' })).toBeVisible();
  });
});
