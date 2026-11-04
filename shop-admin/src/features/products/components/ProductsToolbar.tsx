import { Search } from 'lucide-react';

import { FilterChip } from '@/components/FilterChip';
import { CATEGORY_LABELS } from '@/lib/format';
import type { Category } from '@/models/catalog';
import { CATEGORIES } from '@/models/catalog';

export type CategoryFilter = 'ALL' | Category;

interface ProductsToolbarProps {
  search: string;
  category: CategoryFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CategoryFilter) => void;
}

export function ProductsToolbar({
  search,
  category,
  onSearchChange,
  onCategoryChange
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-sand-100/40"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Buscar productos"
          placeholder="Buscar por nombre, slug o descripción…"
          className="field pl-10"
        />
      </div>

      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex gap-1.5 overflow-x-auto pb-1 xl:pb-0"
      >
        <FilterChip active={category === 'ALL'} onClick={() => onCategoryChange('ALL')}>
          Todos
        </FilterChip>
        {CATEGORIES.map((item) => (
          <FilterChip key={item} active={category === item} onClick={() => onCategoryChange(item)}>
            {CATEGORY_LABELS[item]}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
