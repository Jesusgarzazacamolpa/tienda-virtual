import { z } from 'zod';

import type { CheckoutValues } from '@/models/checkout';

const cardNumber = z
  .string()
  .trim()
  .regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, 'Escribe los 16 dígitos de la tarjeta.');

const cardName = z.string().trim().min(3, 'Escribe el nombre como aparece en la tarjeta.');

const expiry = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Usa el formato MM/AA.');

const cvv = z
  .string()
  .trim()
  .regex(/^\d{3,4}$/, 'El CVV tiene 3 o 4 dígitos.');

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Escribe tu nombre completo.'),
    email: z.email('Escribe un correo válido.'),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, 'Escribe un teléfono de 10 dígitos.'),
    address: z.string().trim().min(5, 'Escribe tu calle y número.'),
    city: z.string().trim().min(2, 'Escribe tu ciudad.'),
    state: z.string().trim().min(2, 'Escribe tu estado.'),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
    paymentMethod: z.enum(['card', 'transfer']),
    cardNumber: z.string().trim().optional(),
    cardName: z.string().trim().optional(),
    expiry: z.string().trim().optional(),
    cvv: z.string().trim().optional()
  })
  .superRefine((values, context) => {
    if (values.paymentMethod !== 'card') return;

    const cardFields = [
      { key: 'cardNumber', schema: cardNumber, value: values.cardNumber },
      { key: 'cardName', schema: cardName, value: values.cardName },
      { key: 'expiry', schema: expiry, value: values.expiry },
      { key: 'cvv', schema: cvv, value: values.cvv }
    ] as const;

    for (const field of cardFields) {
      const result = field.schema.safeParse(field.value ?? '');
      if (!result.success) {
        context.addIssue({
          code: 'custom',
          path: [field.key],
          message: result.error.issues[0]?.message ?? 'Revisa este campo.'
        });
      }
    }
  });

export const checkoutDefaults: CheckoutValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  paymentMethod: 'card',
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: ''
};
