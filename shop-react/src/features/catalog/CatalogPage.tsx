import { useMemo } from 'react';
import { PackageSearch } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import {
  filterAndSortProducts,
  parseCategory,
  parseSort,
  products,
  SORT_OPTIONS
} from '@/services/catalog-service';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDocumentTitle } from '@/shared/lib/use-document-title';

import { CatalogFilters } from './components/CatalogFilters';
import { CatalogHeader } from './components/CatalogHeader';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';

const HERO_PRODUCT = products[0]!;

export function CatalogPage() {
  useDocumentTitle();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const category = parseCategory(searchParams.get('categoria'));
  const sort = parseSort(searchParams.get('orden'));

  const visibleProducts = useMemo(
    () => filterAndSortProducts(products, { q, category, sort }),
    [q, category, sort]
  );

  const hasFilters = q.trim().length > 0 || category !== 'all' || sort !== 'featured';

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    const isDefault = value === '' || value === 'all' || value === 'featured';

    if (isDefault) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return (
    <div>
      <HeroSection featured={HERO_PRODUCT} />

      <section
        id="catalogo"
        aria-labelledby="catalogo-titulo"
        className="container-shell scroll-mt-28 pt-20"
      >
        <CatalogHeader query={q} sort={sort} sortOptions={SORT_OPTIONS} onFilterChange={updateFilter} />

        <CatalogFilters
          category={category}
          resultCount={visibleProducts.length}
          query={q}
          hasFilters={hasFilters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
        />

        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} />
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<PackageSearch className="h-7 w-7" aria-hidden="true" />}
              title="No encontramos coincidencias"
              description="Prueba con otra palabra o quita los filtros para ver la colección completa."
              action={
                <button type="button" onClick={clearFilters} className="btn-primary">
                  Ver todos los productos
                </button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
