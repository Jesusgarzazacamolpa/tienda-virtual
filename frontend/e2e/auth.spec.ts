import { expect, test } from '@playwright/test';

import { ADMIN } from './support/session';

test.describe('Autenticación', () => {
  test('redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/users');

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fusers$/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('muestra el error del backend con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo').fill(ADMIN.email);
    await page.getByLabel('Contraseña').fill('Incorrecta123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByRole('alert')).toContainText('Credenciales inválidas.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('inicia sesión, muestra la identidad y cierra sesión', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo').fill(ADMIN.email);
    await page.getByLabel('Contraseña').fill(ADMIN.password);

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(/\/users$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeVisible();

    const banner = page.getByRole('banner');
    await expect(banner).toContainText('Local Admin');
    await expect(banner).toContainText(ADMIN.email);
    await expect(banner).toContainText('ADMIN');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('backoffice.session')))
      .toBeNull();
  });
});
