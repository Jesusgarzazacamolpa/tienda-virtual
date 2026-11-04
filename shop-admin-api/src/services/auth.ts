import { timingSafeEqual } from 'node:crypto';

const DEFAULT_DEV_TOKEN = 'orbita-admin-dev';

export function getAdminToken(): string {
  return process.env['ADMIN_TOKEN'] ?? DEFAULT_DEV_TOKEN;
}

export function isAuthorized(header: string | null, expectedToken: string): boolean {
  if (!header?.startsWith('Bearer ')) return false;

  const provided = Buffer.from(header.slice('Bearer '.length));
  const expected = Buffer.from(expectedToken);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
