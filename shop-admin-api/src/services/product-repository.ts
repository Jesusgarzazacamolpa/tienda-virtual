import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

import type { Category, Color, Product, ProductDraft } from '../models/types.js';

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compare_at_price: number | null;
  stock: number;
  badge: string | null;
  tagline: string;
  description: string;
  image: string;
  colors: string;
  active: number;
  created_at: string;
}

export interface ProductFilters {
  search?: string | null;
  category?: Category | null;
  active?: boolean | null;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(value: string): string {
  const slug = normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'producto';
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    badge: row.badge,
    tagline: row.tagline,
    description: row.description,
    image: row.image,
    colors: JSON.parse(row.colors) as Color[],
    active: row.active === 1,
    createdAt: row.created_at
  };
}

export function listProducts(db: DatabaseSync, filters: ProductFilters = {}): Product[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters.active !== null && filters.active !== undefined) {
    conditions.push('active = ?');
    params.push(filters.active ? 1 : 0);
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM products${where} ORDER BY active DESC, created_at DESC, name ASC`)
    .all(...params) as unknown as ProductRow[];
  const products = rows.map(mapProduct);

  const term = normalizeText(filters.search?.trim() ?? '');
  if (!term) return products;

  return products.filter((item) =>
    normalizeText(`${item.name} ${item.slug} ${item.tagline} ${item.category}`).includes(term)
  );
}

export function getProduct(db: DatabaseSync, id: string): Product | null {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as
    ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

function createUniqueSlug(db: DatabaseSync, base: string): string {
  let slug = base;
  let suffix = 2;
  while (db.prepare('SELECT 1 FROM products WHERE slug = ?').get(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export function createProduct(db: DatabaseSync, draft: ProductDraft): Product {
  const id = `p-${randomUUID().slice(0, 8)}`;
  const slug = createUniqueSlug(db, slugify(draft.name));
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO products (
      id, slug, name, category, price, compare_at_price, stock, badge,
      tagline, description, image, colors, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    slug,
    draft.name,
    draft.category,
    draft.price,
    draft.compareAtPrice,
    draft.stock,
    draft.badge,
    draft.tagline,
    draft.description,
    draft.image,
    JSON.stringify(draft.colors),
    draft.active ? 1 : 0,
    createdAt
  );

  const created = getProduct(db, id);
  if (!created) throw new Error('No se pudo leer el producto recién creado.');
  return created;
}

export function updateProduct(db: DatabaseSync, id: string, draft: ProductDraft): Product | null {
  const result = db
    .prepare(
      `UPDATE products SET
        name = ?, category = ?, price = ?, compare_at_price = ?, stock = ?, badge = ?,
        tagline = ?, description = ?, image = ?, colors = ?, active = ?
      WHERE id = ?`
    )
    .run(
      draft.name,
      draft.category,
      draft.price,
      draft.compareAtPrice,
      draft.stock,
      draft.badge,
      draft.tagline,
      draft.description,
      draft.image,
      JSON.stringify(draft.colors),
      draft.active ? 1 : 0,
      id
    );

  if (result.changes === 0) return null;
  return getProduct(db, id);
}
