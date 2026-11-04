import { expect, test } from '@playwright/test';

test.describe('Landing pública', () => {
  test('presenta la propuesta de valor y las secciones corporativas', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Ingeniería de Software y Automatización para Operaciones Complejas.',
        level: 1
      })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Agendar Auditoría Técnica Gratuita' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modernización y Arquitectura Cloud-Native' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Equipos Técnicos Dedicados (Staff Augmentation)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ecosistemas Digitales para Operaciones Físicas' })).toBeVisible();
    await expect(page.getByText('Sector financiero', { exact: true })).toBeVisible();
    await expect(page.getByText('E-commerce y logística', { exact: true })).toBeVisible();
    await expect(page.getByText('Sector retail', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'El músculo técnico detrás de tu negocio.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '¿Listo para escalar tu operación?' })).toBeVisible();
  });

  test('rechaza correos gratuitos sin enviar la solicitud', async ({ page }) => {
    await page.goto('/#contacto');

    await page.getByLabel('Nombre completo').fill('Jesús Garza');
    await page.getByLabel('Correo corporativo').fill('jesus@gmail.com');
    await page.getByLabel('Empresa').fill('Grupo Bajío');
    await page.getByLabel('¿Qué desafío principal buscas resolver?').selectOption({ label: 'Integrar sistemas' });

    let submitted = false;
    page.on('request', request => {
      if (request.url().endsWith('/api/v1/leads')) {
        submitted = true;
      }
    });

    await page.getByRole('button', { name: 'Solicitar Evaluación' }).click();

    await expect(page.getByText('Usa tu correo corporativo (no Gmail, Hotmail, etc.).')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Solicitud recibida/ })).toBeHidden();
    expect(submitted).toBe(false);
  });

  test('abre y cierra el menú móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'Abrir menú de navegación' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = page.getByRole('navigation', { name: 'Navegación móvil' });
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole('link', { name: 'Contacto' }).click();
    await expect(mobileNav).toBeHidden();
    await expect(page).toHaveURL(/#contacto$/);
  });

  test('registra un lead corporativo contra el endpoint real', async ({ page }) => {
    await page.goto('/#contacto');

    await page.getByLabel('Nombre completo').fill('Jesús Garza');
    await page.getByLabel('Correo corporativo').fill('jesus@garza.com.mx');
    await page.getByLabel('Empresa').fill('Garza Software Partners');
    await page.getByLabel('¿Qué desafío principal buscas resolver?').selectOption({ label: 'Desarrollo a la medida' });

    const responsePromise = page.waitForResponse(
      response => response.url().endsWith('/api/v1/leads') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Solicitar Evaluación' }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ id: expect.any(String), createdAt: expect.any(String) });

    await expect(page.getByRole('heading', { name: 'Solicitud recibida, Jesús.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar otra solicitud' })).toBeVisible();
  });
});
