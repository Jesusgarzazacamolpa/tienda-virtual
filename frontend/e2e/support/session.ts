import { APIRequestContext, Page } from '@playwright/test';

export const ADMIN = {
  email: process.env['E2E_ADMIN_EMAIL'] ?? 'admin@backoffice.local',
  password: process.env['E2E_ADMIN_PASSWORD'] ?? 'Admin123!'
};

const API_URL = process.env['E2E_API_URL'] ?? 'http://localhost:8080/api/v1';

interface LoginResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    roles: string[];
  };
}

export async function loginThroughApi(request: APIRequestContext): Promise<LoginResponse> {
  const response = await request.post(`${API_URL}/auth/login`, { data: ADMIN });
  if (!response.ok()) {
    throw new Error(`Login E2E falló (${response.status()}): ${await response.text()}`);
  }
  return (await response.json()) as LoginResponse;
}

export async function seedSession(page: Page, response: LoginResponse): Promise<void> {
  const session = {
    token: response.accessToken,
    expiresAt: Date.now() + response.expiresInSeconds * 1000,
    user: response.user
  };

  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    ['backoffice.session', JSON.stringify(session)] as [string, string]
  );
}

export function uniqueEmail(prefix = 'e2e'): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${Date.now()}.${suffix}@test.com`;
}
