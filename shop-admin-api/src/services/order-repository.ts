import type { DatabaseSync } from 'node:sqlite';

import type { Order, OrderStatus, PaymentMethod } from '../models/types.js';

interface OrderRow {
  id: string;
  created_at: string;
  estimated_delivery: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
}

interface OrderItemRow {
  product_id: string;
  name: string;
  color: string;
  quantity: number;
  unit_price: number;
}

function mapOrder(db: DatabaseSync, row: OrderRow): Order {
  const items = db
    .prepare(
      `SELECT product_id, name, color, quantity, unit_price
       FROM order_items WHERE order_id = ? ORDER BY id`
    )
    .all(row.id) as unknown as OrderItemRow[];

  return {
    id: row.id,
    createdAt: row.created_at,
    estimatedDelivery: row.estimated_delivery,
    customer: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code
    },
    paymentMethod: row.payment_method,
    status: row.status,
    lines: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unit_price
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total
  };
}

export function listOrders(db: DatabaseSync, status?: OrderStatus | null): Order[] {
  const rows = (status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()) as unknown as OrderRow[];

  return rows.map((row) => mapOrder(db, row));
}

export function getOrder(db: DatabaseSync, id: string): Order | null {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as unknown as
    OrderRow | undefined;
  return row ? mapOrder(db, row) : null;
}
