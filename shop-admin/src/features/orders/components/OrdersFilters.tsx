import { FilterChip } from '@/components/FilterChip';
import { STATUS_LABELS } from '@/lib/format';
import type { OrderStatus } from '@/models/order';
import { ORDER_STATUSES } from '@/models/order';

export type StatusFilter = 'ALL' | OrderStatus;

interface OrdersFiltersProps {
  status: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

export function OrdersFilters({ status, onChange }: OrdersFiltersProps) {
  return (
    <div className="border-b border-white/10 p-4 sm:p-5">
      <div
        role="group"
        aria-label="Filtrar por estado"
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        <FilterChip active={status === 'ALL'} onClick={() => onChange('ALL')}>
          Todos
        </FilterChip>
        {ORDER_STATUSES.map((item) => (
          <FilterChip key={item} active={status === item} onClick={() => onChange(item)}>
            {STATUS_LABELS[item]}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
