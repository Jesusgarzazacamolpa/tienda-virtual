import { z } from 'zod';

import type { Product } from '@/models/catalog';
import { CATEGORIES } from '@/models/catalog';

export const IMAGE_SUGGESTIONS = [
  '/products/aura-studio.webp',
  '/products/pulse-mini.webp',
  '/products/drift-runner.webp',
  '/products/nomad-pack.webp',
  '/products/halo-one.webp',
  '/products/lumen-arc.webp',
  '/products/terra-cup.webp',
  '/products/form-chair.webp'
];

const colorSchema = z.object({
  name: z.string().trim().min(1, 'Cada color necesita un nombre.').max(40, 'Máximo 40 caracteres.'),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Usa un color hexadecimal como #1f2328.')
});

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(80, 'El nombre no puede superar 80 caracteres.'),
    category: z.enum(CATEGORIES),
    price: z
      .number({ error: 'Escribe un precio válido.' })
      .positive('El precio debe ser mayor que cero.')
      .max(1_000_000, 'El precio supera el máximo permitido.'),
    compareAtPrice: z
      .number({ error: 'Escribe un precio válido.' })
      .positive('El precio anterior debe ser mayor que cero.')
      .max(1_000_000, 'El precio anterior supera el máximo permitido.')
      .nullable(),
    stock: z
      .number({ error: 'Escribe un stock válido.' })
      .int('El stock debe ser un número entero.')
      .min(0, 'El stock no puede ser negativo.')
      .max(10_000, 'El stock supera el máximo permitido.'),
    badge: z.string().trim().max(40, 'La etiqueta no puede superar 40 caracteres.'),
    tagline: z
      .string()
      .trim()
      .min(5, 'La descripción corta debe tener al menos 5 caracteres.')
      .max(120, 'La descripción corta no puede superar 120 caracteres.'),
    description: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres.')
      .max(1000, 'La descripción no puede superar 1000 caracteres.'),
    image: z
      .string()
      .trim()
      .regex(
        /^\/products\/[a-z0-9-]+\.webp$/i,
        'Usa una imagen local como /products/aura-studio.webp.'
      ),
    colors: z
      .array(colorSchema)
      .min(1, 'Agrega al menos un color.')
      .max(6, 'Puedes agregar hasta 6 colores.'),
    active: z.boolean()
  })
  .superRefine((values, context) => {
    if (values.compareAtPrice !== null && values.compareAtPrice <= values.price) {
      context.addIssue({
        code: 'custom',
        path: ['compareAtPrice'],
        message: 'El precio anterior debe ser mayor que el precio actual.'
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function toFormValues(product: Product | null): ProductFormValues {
  if (!product) {
    return {
      name: '',
      category: 'AUDIO',
      price: 0,
      compareAtPrice: null,
      stock: 0,
      badge: '',
      tagline: '',
      description: '',
      image: '/products/aura-studio.webp',
      colors: [{ name: 'Negro', hex: '#1f2328' }],
      active: true
    };
  }

  return {
    name: product.name,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    badge: product.badge ?? '',
    tagline: product.tagline,
    description: product.description,
    image: product.image,
    colors: product.colors,
    active: product.active
  };
}
