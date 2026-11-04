export const CATEGORIES = [
  { id: 'audio', label: 'Audio' },
  { id: 'calzado', label: 'Calzado' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'hogar', label: 'Hogar' }
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  colors: ProductColor[];
  features: string[];
  badge?: string;
  stock: number;
}

export function categoryLabel(category: CategoryId): string {
  return CATEGORIES.find((option) => option.id === category)?.label ?? category;
}
