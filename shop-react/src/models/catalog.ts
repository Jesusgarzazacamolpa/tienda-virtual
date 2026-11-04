import type { CategoryId } from './product';

export type SortId = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export interface SortOption {
  id: SortId;
  label: string;
}

export interface CatalogFilters {
  q: string;
  category: CategoryId | 'all';
  sort: SortId;
}
