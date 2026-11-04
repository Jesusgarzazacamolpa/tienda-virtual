import type { Order, Product } from '../models/types.js';

const product = (
  id: string,
  slug: string,
  name: string,
  category: Product['category'],
  price: number,
  stock: number,
  tagline: string,
  description: string,
  image: string,
  colors: Product['colors'],
  createdAt: string,
  extras: Partial<Pick<Product, 'compareAtPrice' | 'badge' | 'active'>> = {}
): Product => ({
  id,
  slug,
  name,
  category,
  price,
  compareAtPrice: extras.compareAtPrice ?? null,
  stock,
  badge: extras.badge ?? null,
  tagline,
  description,
  image,
  colors,
  active: extras.active ?? true,
  createdAt
});

export const seedProducts: Product[] = [
  product(
    'p-aura-studio',
    'aura-studio',
    'Aura Studio',
    'AUDIO',
    3490,
    18,
    'Audífonos de diadema con cancelación activa',
    'Sonido envolvente con cancelación activa de ruido, diadema de aluminio y almohadillas de memoria. Diseñados para jornadas largas: 40 horas de batería y carga rápida por USB-C.',
    '/products/aura-studio.webp',
    [
      { name: 'Negro', hex: '#1f2328' },
      { name: 'Arena', hex: '#cbbfa8' }
    ],
    '2026-09-18T15:00:00.000Z',
    { compareAtPrice: 3990, badge: 'Más vendido' }
  ),
  product(
    'p-pulse-mini',
    'pulse-mini',
    'Pulse Mini',
    'AUDIO',
    1290,
    32,
    'Bocina portátil resistente al agua',
    'Una bocina compacta con sonido cálido y graves sorprendentes. Tejido reciclado, anillo de aluminio y resistencia al agua IPX5 para llevarla a cualquier lugar.',
    '/products/pulse-mini.webp',
    [
      { name: 'Azul pizarra', hex: '#4a5b6b' },
      { name: 'Terracota', hex: '#b4684f' }
    ],
    '2026-10-01T15:00:00.000Z',
    { badge: 'Nuevo' }
  ),
  product(
    'p-drift-runner',
    'drift-runner',
    'Drift Runner',
    'CALZADO',
    1890,
    24,
    'Tenis urbanos de perfil bajo',
    'Silueta limpia, materiales ligeros y una suela de caucho reciclado pensada para caminar todo el día. El básico versátil que combina con todo.',
    '/products/drift-runner.webp',
    [
      { name: 'Arena', hex: '#d9cfbc' },
      { name: 'Negro', hex: '#22262b' }
    ],
    '2026-09-10T15:00:00.000Z'
  ),
  product(
    'p-nomad-pack',
    'nomad-pack',
    'Nomad Pack',
    'ACCESORIOS',
    2190,
    12,
    'Mochila de lona con herrajes de latón',
    'Lona gruesa, correas de piel y un compartimento acolchado para laptop de 15 pulgadas. Diseñada para el trabajo diario y las escapadas de fin de semana.',
    '/products/nomad-pack.webp',
    [
      { name: 'Oliva', hex: '#5c6150' },
      { name: 'Negro', hex: '#25282a' }
    ],
    '2026-08-22T15:00:00.000Z',
    { badge: 'Edición limitada' }
  ),
  product(
    'p-halo-one',
    'halo-one',
    'Halo One',
    'ACCESORIOS',
    2890,
    9,
    'Reloj analógico de acero con malla milanesa',
    'Movimiento de cuarzo suizo, caja de acero cepillado y malla milanesa ajustable. Un reloj sobrio que funciona igual de bien con traje que con playera.',
    '/products/halo-one.webp',
    [
      { name: 'Acero', hex: '#b8bcc0' },
      { name: 'Oro cepillado', hex: '#c9a86a' }
    ],
    '2026-08-15T15:00:00.000Z',
    { compareAtPrice: 3290 }
  ),
  product(
    'p-lumen-arc',
    'lumen-arc',
    'Lumen Arc',
    'HOGAR',
    1590,
    15,
    'Lámpara de escritorio con luz cálida regulable',
    'Un arco escultórico en metal pintado con luz LED regulable de 2700 K a 4000 K. Ideal para escribir, leer o simplemente ambientar el espacio.',
    '/products/lumen-arc.webp',
    [
      { name: 'Crema', hex: '#e3d9c6' },
      { name: 'Negro', hex: '#24272b' }
    ],
    '2026-09-25T15:00:00.000Z'
  ),
  product(
    'p-terra-cup',
    'terra-cup',
    'Terra Cup',
    'HOGAR',
    390,
    40,
    'Taza de cerámica hecha a mano',
    'Cada taza se tornea a mano y se cuece en horno de alta temperatura. El esmalte mate y las variaciones de tono hacen que ninguna sea igual a otra.',
    '/products/terra-cup.webp',
    [
      { name: 'Terracota', hex: '#b0654d' },
      { name: 'Arena', hex: '#d6c8b2' }
    ],
    '2026-07-30T15:00:00.000Z'
  ),
  product(
    'p-form-chair',
    'form-chair',
    'Form Chair',
    'HOGAR',
    6900,
    5,
    'Sillón bajo de roble y bouclé',
    'Estructura de roble macizo con cojín de bouclé ivory. Un asiento generoso y acogedor que se convierte en el rincón favorito de la casa.',
    '/products/form-chair.webp',
    [
      { name: 'Marfil', hex: '#e8e0d1' },
      { name: 'Oliva', hex: '#6b6d56' }
    ],
    '2026-08-05T15:00:00.000Z',
    { badge: 'Hecho a mano' }
  )
];

export const seedOrders: Order[] = [
  {
    id: 'ORD-A1B2C3',
    createdAt: '2026-11-02T16:20:00.000Z',
    estimatedDelivery: '2026-11-06T16:20:00.000Z',
    customer: {
      fullName: 'Ana López',
      email: 'ana@empresa.com',
      phone: '5512345678',
      address: 'Av. Reforma 123, Col. Centro',
      city: 'Guadalajara',
      state: 'Jalisco',
      postalCode: '44100'
    },
    paymentMethod: 'card',
    status: 'PAID',
    lines: [
      {
        productId: 'p-aura-studio',
        name: 'Aura Studio',
        color: 'Negro',
        quantity: 1,
        unitPrice: 3490
      },
      {
        productId: 'p-terra-cup',
        name: 'Terra Cup',
        color: 'Terracota',
        quantity: 2,
        unitPrice: 390
      }
    ],
    subtotal: 4270,
    shipping: 0,
    total: 4270
  },
  {
    id: 'ORD-D4E5F6',
    createdAt: '2026-11-03T18:05:00.000Z',
    estimatedDelivery: '2026-11-07T18:05:00.000Z',
    customer: {
      fullName: 'Carlos Méndez',
      email: 'carlos@estudio.mx',
      phone: '3312345678',
      address: 'Calle Independencia 88',
      city: 'Monterrey',
      state: 'Nuevo León',
      postalCode: '64000'
    },
    paymentMethod: 'transfer',
    status: 'PENDING',
    lines: [
      {
        productId: 'p-nomad-pack',
        name: 'Nomad Pack',
        color: 'Oliva',
        quantity: 1,
        unitPrice: 2190
      },
      {
        productId: 'p-terra-cup',
        name: 'Terra Cup',
        color: 'Arena',
        quantity: 1,
        unitPrice: 390
      }
    ],
    subtotal: 2580,
    shipping: 0,
    total: 2580
  },
  {
    id: 'ORD-G7H8I9',
    createdAt: '2026-10-28T14:40:00.000Z',
    estimatedDelivery: '2026-11-01T14:40:00.000Z',
    customer: {
      fullName: 'Sofía Ramírez',
      email: 'sofia@casa.mx',
      phone: '8112345678',
      address: 'Av. Constitución 1500',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06700'
    },
    paymentMethod: 'card',
    status: 'SHIPPED',
    lines: [
      {
        productId: 'p-form-chair',
        name: 'Form Chair',
        color: 'Marfil',
        quantity: 1,
        unitPrice: 6900
      },
      {
        productId: 'p-lumen-arc',
        name: 'Lumen Arc',
        color: 'Crema',
        quantity: 1,
        unitPrice: 1590
      }
    ],
    subtotal: 8490,
    shipping: 0,
    total: 8490
  },
  {
    id: 'ORD-J0K1L2',
    createdAt: '2026-10-20T11:15:00.000Z',
    estimatedDelivery: '2026-10-24T11:15:00.000Z',
    customer: {
      fullName: 'Diego Ortega',
      email: 'diego@correo.mx',
      phone: '2212345678',
      address: 'Calle 5 de Mayo 42',
      city: 'Puebla',
      state: 'Puebla',
      postalCode: '72000'
    },
    paymentMethod: 'card',
    status: 'DELIVERED',
    lines: [
      {
        productId: 'p-drift-runner',
        name: 'Drift Runner',
        color: 'Arena',
        quantity: 1,
        unitPrice: 1890
      },
      {
        productId: 'p-terra-cup',
        name: 'Terra Cup',
        color: 'Terracota',
        quantity: 1,
        unitPrice: 390
      }
    ],
    subtotal: 2280,
    shipping: 0,
    total: 2280
  }
];
