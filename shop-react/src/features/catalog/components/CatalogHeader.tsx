import { Search } from 'lucide-react';

import type { SortId } from '@/models/catalog';
import type { SortOption } from '@/models/catalog';

interface CatalogHeaderProps {
  query: string;
  sort: SortId;
  sortOptions: SortOption[];
  onFilterChange: (key: string, value: string) => void;
}

export function CatalogHeader({ query, sort, sortOptions, onFilterChange }: CatalogHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">Catálogo</p>
        <h2
          id="catalogo-titulo"
          className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Piezas elegidas una por una
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand-100/60">
          Ocho objetos para vivir mejor: audio, calzado, accesorios y hogar. Sin ruido, sin relleno.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-sand-100/40"
            aria-hidden="true"
          />
          <label htmlFor="catalogo-buscar" className="sr-only">
            Buscar productos
          </label>
          <input
            id="catalogo-buscar"
            type="search"
            value={query}
            onChange={(event) => onFilterChange('q', event.target.value)}
            placeholder="Buscar audífonos, taza…"
            className="field pl-11"
          />
        </div>

        <div>
          <label htmlFor="catalogo-orden" className="sr-only">
            Ordenar por
          </label>
          <select
            id="catalogo-orden"
            value={sort}
            onChange={(event) => onFilterChange('orden', event.target.value)}
            className="field w-full cursor-pointer appearance-none pr-10 sm:w-56"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-ink-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
