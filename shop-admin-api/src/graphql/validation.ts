import { z } from 'zod';

import { CATEGORIES, type ProductDraft } from '../models/types.js';

const colorSchema = z.object({
  name: z.string().trim().min(1, 'Cada color necesita un nombre.').max(40),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Usa un color hexadecimal como #1f2328.')
});

export const productDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(80, 'El nombre no puede superar 80 caracteres.'),
    category: z.enum(CATEGORIES),
    price: z
      .number()
      .positive('El precio debe ser mayor que cero.')
      .max(1_000_000, 'El precio supera el máximo permitido.'),
    compareAtPrice: z
      .number()
      .positive('El precio anterior debe ser mayor que cero.')
      .max(1_000_000, 'El precio anterior supera el máximo permitido.')
      .nullish()
      .transform((value) => value ?? null),
    stock: z
      .number()
      .int('El stock debe ser un número entero.')
      .min(0, 'El stock no puede ser negativo.')
      .max(10_000, 'El stock supera el máximo permitido.'),
    badge: z
      .string()
      .trim()
      .max(40, 'La etiqueta no puede superar 40 caracteres.')
      .nullish()
      .transform((value) => (value && value.length > 0 ? value : null)),
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
  .superRefine((values, ctx) => {
    if (values.compareAtPrice !== null && values.compareAtPrice <= values.price) {
      ctx.addIssue({
        code: 'custom',
        path: ['compareAtPrice'],
        message: 'El precio anterior debe ser mayor que el precio actual.'
      });
    }
  });

export type ProductDraftValidation =
  | { success: true; data: ProductDraft }
  | { success: false; message: string; issues: { path: string; message: string }[] };

export function parseProductDraft(input: unknown): ProductDraftValidation {
  const result = productDraftSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    message: result.error.issues[0]?.message ?? 'Los datos del producto no son válidos.',
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }))
  };
}
