import { X } from 'lucide-react';

import { CATEGORIES, type CategoryId } from '@/models/product';

interface CatalogFiltersProps {
  category: CategoryId | 'all';
  resultCount: number;
  query: string;
  hasFilters: boolean;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function CatalogFilters({
  category,
  resultCount,
  query,
  hasFilters,
  onFilterChange,
  onClearFilters
}: CatalogFiltersProps) {
  return (
    <>
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => onFilterChange('categoria', 'all')}
          aria-pressed={category === 'all'}
          className={`chip ${category === 'all' ? 'chip-active' : ''}`}
        >
          Todos
        </button>
        {CATEGORIES.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onFilterChange('categoria', option.id)}
            aria-pressed={category === option.id}
            className={`chip ${category === option.id ? 'chip-active' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-4">
        <p aria-live="polite" className="text-sm text-sand-100/55">
          {resultCount} {resultCount === 1 ? 'producto' : 'productos'}
          {query.trim() && (
            <>
              {' '}
              para <span className="font-medium text-sand-50">“{query.trim()}”</span>
            </>
          )}
        </p>
        {hasFilters && (
          <button type="button" onClick={onClearFilters} className="btn-ghost text-xs">
            <X className="h-4 w-4" aria-hidden="true" />
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  );
}
