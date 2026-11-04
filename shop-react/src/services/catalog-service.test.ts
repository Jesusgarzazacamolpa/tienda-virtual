import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';

import { filterAndSortProducts, normalizeSearch, parseCategory, parseSort } from './catalog-service';

describe('catalog service', () => {
  it('normaliza acentos y mayúsculas para buscar', () => {
    expect(normalizeSearch('  Audífonos ')).toBe('audifonos');
  });

  it('encuentra productos aunque la búsqueda no lleve acentos', () => {
    const result = filterAndSortProducts(products, {
      q: 'audifonos',
      category: 'all',
      sort: 'featured'
    });

    expect(result.map((product) => product.name)).toEqual(['Aura Studio']);
  });

  it('filtra por categoría', () => {
    const result = filterAndSortProducts(products, {
      q: '',
      category: 'calzado',
      sort: 'featured'
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Drift Runner');
  });

  it('ordena por precio ascendente y descendente', () => {
    const ascending = filterAndSortProducts(products, {
      q: '',
      category: 'all',
      sort: 'price-asc'
    });
    const descending = filterAndSortProducts(products, {
      q: '',
      category: 'all',
      sort: 'price-desc'
    });

    expect(ascending[0]?.name).toBe('Terra Cup');
    expect(descending[0]?.name).toBe('Form Chair');
  });

  it('ordena por calificación', () => {
    const result = filterAndSortProducts(products, {
      q: '',
      category: 'all',
      sort: 'rating'
    });

    expect(result[0]?.rating).toBe(4.9);
  });

  it('devuelve una lista vacía cuando no hay coincidencias', () => {
    const result = filterAndSortProducts(products, {
      q: 'televisor',
      category: 'all',
      sort: 'featured'
    });

    expect(result).toEqual([]);
  });

  it('cae en valores por defecto para parámetros inválidos', () => {
    expect(parseCategory('inexistente')).toBe('all');
    expect(parseCategory(null)).toBe('all');
    expect(parseCategory('audifonos')).toBe('all');
    expect(parseSort('precio')).toBe('featured');
    expect(parseSort('rating')).toBe('rating');
  });
});
