import { products } from '@/data/products';
import type { CatalogFilters, SortId, SortOption } from '@/models/catalog';
import { CATEGORIES, categoryLabel, type CategoryId, type Product } from '@/models/product';

export { products };

export const SORT_OPTIONS: SortOption[] = [
  { id: 'featured', label: 'Selección de la casa' },
  { id: 'price-asc', label: 'Precio: menor a mayor' },
  { id: 'price-desc', label: 'Precio: mayor a menor' },
  { id: 'rating', label: 'Mejor valorados' }
];

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function findProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function parseCategory(value: string | null): CategoryId | 'all' {
  return CATEGORIES.some((option) => option.id === value) ? (value as CategoryId) : 'all';
}

export function parseSort(value: string | null): SortId {
  return SORT_OPTIONS.some((option) => option.id === value) ? (value as SortId) : 'featured';
}

export function filterAndSortProducts(
  catalog: readonly Product[],
  { q, category, sort }: CatalogFilters
): Product[] {
  const term = normalizeSearch(q);

  const filtered = catalog.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    if (!matchesCategory) return false;
    if (!term) return true;

    const haystack = normalizeSearch(
      [
        product.name,
        product.tagline,
        product.description,
        categoryLabel(product.category),
        ...product.colors.map((color) => color.name)
      ].join(' ')
    );

    return haystack.includes(term);
  });

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'featured':
      default:
        return 0;
    }
  });
}
