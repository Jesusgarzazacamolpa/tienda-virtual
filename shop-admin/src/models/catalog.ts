export const CATEGORIES = ['AUDIO', 'CALZADO', 'ACCESORIOS', 'HOGAR'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  badge: string | null;
  tagline: string;
  description: string;
  image: string;
  colors: Color[];
  active: boolean;
  createdAt: string;
}

export interface ProductInput {
  name: string;
  category: Category;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  badge: string | null;
  tagline: string;
  description: string;
  image: string;
  colors: Color[];
  active: boolean;
}
