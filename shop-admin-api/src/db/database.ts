import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { seedOrders, seedProducts } from './seed-data.js';

const SCHEMA_VERSION = 1;

function migrate(db: DatabaseSync): void {
  const row = db.prepare('PRAGMA user_version').get() as { user_version: number } | undefined;
  if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;

  db.exec('BEGIN');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('AUDIO', 'CALZADO', 'ACCESORIOS', 'HOGAR')),
        price REAL NOT NULL CHECK (price > 0),
        compare_at_price REAL,
        stock INTEGER NOT NULL CHECK (stock >= 0),
        badge TEXT,
        tagline TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        colors TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        estimated_delivery TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'transfer')),
        status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
        subtotal REAL NOT NULL,
        shipping REAL NOT NULL,
        total REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

      PRAGMA user_version = 1;
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function seed(db: DatabaseSync): void {
  const row = db.prepare('SELECT COUNT(*) AS total FROM products').get() as { total: number };
  if (row.total > 0) return;

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, slug, name, category, price, compare_at_price, stock, badge,
      tagline, description, image, colors, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, created_at, estimated_delivery, full_name, email, phone, address,
      city, state, postal_code, payment_method, status, subtotal, shipping, total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, color, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const item of seedProducts) {
      insertProduct.run(
        item.id,
        item.slug,
        item.name,
        item.category,
        item.price,
        item.compareAtPrice,
        item.stock,
        item.badge,
        item.tagline,
        item.description,
        item.image,
        JSON.stringify(item.colors),
        item.active ? 1 : 0,
        item.createdAt
      );
    }

    for (const order of seedOrders) {
      insertOrder.run(
        order.id,
        order.createdAt,
        order.estimatedDelivery,
        order.customer.fullName,
        order.customer.email,
        order.customer.phone,
        order.customer.address,
        order.customer.city,
        order.customer.state,
        order.customer.postalCode,
        order.paymentMethod,
        order.status,
        order.subtotal,
        order.shipping,
        order.total
      );
      for (const line of order.lines) {
        insertItem.run(
          order.id,
          line.productId,
          line.name,
          line.color,
          line.quantity,
          line.unitPrice
        );
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function openDatabase(
  filePath = process.env['ADMIN_DB_PATH'] ?? 'data/orbita-admin.db'
): DatabaseSync {
  if (filePath !== ':memory:') {
    mkdirSync(dirname(resolve(filePath)), { recursive: true });
  }

  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (filePath !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');

  migrate(db);
  seed(db);
  return db;
}
