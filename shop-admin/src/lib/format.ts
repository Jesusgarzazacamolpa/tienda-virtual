import type { Category } from '@/models/catalog';
import type { OrderStatus, PaymentMethod } from '@/models/order';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export const CATEGORY_LABELS: Record<Category, string> = {
  AUDIO: 'Audio',
  CALZADO: 'Calzado',
  ACCESORIOS: 'Accesorios',
  HOGAR: 'Hogar'
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia'
};

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value);
}
