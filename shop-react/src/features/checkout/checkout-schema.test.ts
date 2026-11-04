import { describe, expect, it } from 'vitest';

import { checkoutDefaults, checkoutSchema } from './checkout-schema';

const validValues = {
  ...checkoutDefaults,
  fullName: 'Ana López',
  email: 'ana@empresa.com',
  phone: '5512345678',
  address: 'Av. Reforma 123',
  city: 'Guadalajara',
  state: 'Jalisco',
  postalCode: '44100',
  paymentMethod: 'card' as const,
  cardNumber: '4242 4242 4242 4242',
  cardName: 'Ana López',
  expiry: '12/28',
  cvv: '123'
};

function issuePaths(input: unknown): string[] {
  const result = checkoutSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('checkout schema', () => {
  it('acepta un pedido con tarjeta completo', () => {
    expect(checkoutSchema.safeParse(validValues).success).toBe(true);
  });

  it('acepta transferencia sin datos de tarjeta', () => {
    const result = checkoutSchema.safeParse({
      ...validValues,
      paymentMethod: 'transfer',
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: ''
    });

    expect(result.success).toBe(true);
  });

  it('exige los datos de tarjeta cuando el método es tarjeta', () => {
    const paths = issuePaths({ ...validValues, cardNumber: '', cardName: '', expiry: '', cvv: '' });

    expect(paths).toEqual(expect.arrayContaining(['cardNumber', 'cardName', 'expiry', 'cvv']));
  });

  it('valida correo, teléfono y código postal', () => {
    const paths = issuePaths({
      ...validValues,
      email: 'correo-invalido',
      phone: '123',
      postalCode: '441'
    });

    expect(paths).toEqual(expect.arrayContaining(['email', 'phone', 'postalCode']));
  });

  it('rechaza un formato de vencimiento incorrecto', () => {
    const paths = issuePaths({ ...validValues, expiry: '13/28' });

    expect(paths).toContain('expiry');
  });
});
