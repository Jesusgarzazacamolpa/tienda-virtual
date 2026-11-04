import type { CartTotals, PricedLine } from '@/models/cart';
import type { CheckoutValues } from '@/models/checkout';
import type { Order } from '@/models/order';

const STORAGE_KEY = 'orbita-orders-v1';
const MAX_STORED_ORDERS = 20;

function generateOrderId(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${suffix}`;
}

function readOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function createOrder(
  values: CheckoutValues,
  lines: PricedLine[],
  totals: CartTotals
): Order {
  const now = new Date();
  const estimatedDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  return {
    id: generateOrderId(),
    createdAt: now.toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString(),
    customer: {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim()
    },
    paymentMethod: values.paymentMethod,
    lines: lines.map((line) => ({
      productId: line.productId,
      slug: line.product.slug,
      name: line.product.name,
      color: line.color,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      image: line.product.image
    })),
    totals
  };
}

export function saveOrder(order: Order): void {
  try {
    const orders = [order, ...readOrders()].slice(0, MAX_STORED_ORDERS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // El pedido ya se confirmó en pantalla aunque el almacenamiento no esté disponible.
  }
}

export function getOrder(id: string): Order | undefined {
  return readOrders().find((order) => order.id === id);
}

export function paymentMethodLabel(method: Order['paymentMethod']): string {
  return method === 'card'
    ? 'Tarjeta terminación 4242 (simulada)'
    : 'Transferencia SPEI (simulada)';
}
