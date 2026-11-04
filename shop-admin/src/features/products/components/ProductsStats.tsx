import { AlertTriangle, Check, CircleDollarSign, Package } from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { formatPrice } from '@/lib/format';

export interface ProductMetrics {
  total: number;
  active: number;
  lowStock: number;
  inventoryValue: number;
}

export function ProductsStats({ total, active, lowStock, inventoryValue }: ProductMetrics) {
  return (
    <section aria-label="Resumen del catálogo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Package} label="Productos" value={String(total)} detail="En el catálogo" />
      <StatCard
        icon={Check}
        label="Activos"
        value={String(active)}
        detail="Visibles en la tienda"
        tone="emerald"
      />
      <StatCard
        icon={AlertTriangle}
        label="Stock bajo"
        value={String(lowStock)}
        detail="10 unidades o menos"
        tone={lowStock > 0 ? 'amber' : 'neutral'}
      />
      <StatCard
        icon={CircleDollarSign}
        label="Valor del inventario"
        value={formatPrice(inventoryValue)}
        detail="Precio × existencias"
        tone="signal"
      />
    </section>
  );
}
