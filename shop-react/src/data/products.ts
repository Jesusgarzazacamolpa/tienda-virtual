import type { Product } from '@/models/product';

export const products: Product[] = [
  {
    id: 'p-aura-studio',
    slug: 'aura-studio',
    name: 'Aura Studio',
    category: 'audio',
    tagline: 'Audífonos de diadema con cancelación activa',
    description:
      'Sonido envolvente con cancelación activa de ruido, diadema de aluminio y almohadillas de memoria. Diseñados para jornadas largas: 40 horas de batería y carga rápida por USB-C.',
    price: 3490,
    compareAtPrice: 3990,
    rating: 4.9,
    reviewCount: 128,
    image: '/products/aura-studio.webp',
    colors: [
      { name: 'Negro', hex: '#1f2328' },
      { name: 'Arena', hex: '#cbbfa8' }
    ],
    features: ['Cancelación activa de ruido', '40 h de batería', 'Carga rápida USB-C'],
    badge: 'Más vendido',
    stock: 18
  },
  {
    id: 'p-pulse-mini',
    slug: 'pulse-mini',
    name: 'Pulse Mini',
    category: 'audio',
    tagline: 'Bocina portátil resistente al agua',
    description:
      'Una bocina compacta con sonido cálido y graves sorprendentes. Tejido reciclado, anillo de aluminio y resistencia al agua IPX5 para llevarla a cualquier lugar.',
    price: 1290,
    rating: 4.7,
    reviewCount: 86,
    image: '/products/pulse-mini.webp',
    colors: [
      { name: 'Azul pizarra', hex: '#4a5b6b' },
      { name: 'Terracota', hex: '#b4684f' }
    ],
    features: ['Resistencia IPX5', '12 h de batería', 'Emparejamiento estéreo'],
    badge: 'Nuevo',
    stock: 32
  },
  {
    id: 'p-drift-runner',
    slug: 'drift-runner',
    name: 'Drift Runner',
    category: 'calzado',
    tagline: 'Tenis urbanos de perfil bajo',
    description:
      'Silueta limpia, materiales ligeros y una suela de caucho reciclado pensada para caminar todo el día. El básico versátil que combina con todo.',
    price: 1890,
    rating: 4.8,
    reviewCount: 214,
    image: '/products/drift-runner.webp',
    colors: [
      { name: 'Arena', hex: '#d9cfbc' },
      { name: 'Negro', hex: '#22262b' }
    ],
    features: ['Suela de caucho reciclado', 'Plantilla acolchada', 'Diseño unisex'],
    stock: 24
  },
  {
    id: 'p-nomad-pack',
    slug: 'nomad-pack',
    name: 'Nomad Pack',
    category: 'accesorios',
    tagline: 'Mochila de lona con herrajes de latón',
    description:
      'Lona gruesa, correas de piel y un compartimento acolchado para laptop de 15 pulgadas. Diseñada para el trabajo diario y las escapadas de fin de semana.',
    price: 2190,
    rating: 4.9,
    reviewCount: 67,
    image: '/products/nomad-pack.webp',
    colors: [
      { name: 'Oliva', hex: '#5c6150' },
      { name: 'Negro', hex: '#25282a' }
    ],
    features: ['Laptop hasta 15"', 'Lona repelente al agua', 'Bolsillo antirrobo'],
    badge: 'Edición limitada',
    stock: 12
  },
  {
    id: 'p-halo-one',
    slug: 'halo-one',
    name: 'Halo One',
    category: 'accesorios',
    tagline: 'Reloj analógico de acero con malla milanesa',
    description:
      'Movimiento de cuarzo suizo, caja de acero cepillado y malla milanesa ajustable. Un reloj sobrio que funciona igual de bien con traje que con playera.',
    price: 2890,
    compareAtPrice: 3290,
    rating: 4.8,
    reviewCount: 94,
    image: '/products/halo-one.webp',
    colors: [
      { name: 'Acero', hex: '#b8bcc0' },
      { name: 'Oro cepillado', hex: '#c9a86a' }
    ],
    features: ['Movimiento suizo', 'Cristal mineral', 'Resistente al agua 5 ATM'],
    stock: 9
  },
  {
    id: 'p-lumen-arc',
    slug: 'lumen-arc',
    name: 'Lumen Arc',
    category: 'hogar',
    tagline: 'Lámpara de escritorio con luz cálida regulable',
    description:
      'Un arco escultórico en metal pintado con luz LED regulable de 2700 K a 4000 K. Ideal para escribir, leer o simplemente ambientar el espacio.',
    price: 1590,
    rating: 4.6,
    reviewCount: 41,
    image: '/products/lumen-arc.webp',
    colors: [
      { name: 'Crema', hex: '#e3d9c6' },
      { name: 'Negro', hex: '#24272b' }
    ],
    features: ['Luz regulable', 'LED de bajo consumo', 'Base estable'],
    stock: 15
  },
  {
    id: 'p-terra-cup',
    slug: 'terra-cup',
    name: 'Terra Cup',
    category: 'hogar',
    tagline: 'Taza de cerámica hecha a mano',
    description:
      'Cada taza se tornea a mano y se cuece en horno de alta temperatura. El esmalte mate y las variaciones de tono hacen que ninguna sea igual a otra.',
    price: 390,
    rating: 4.7,
    reviewCount: 156,
    image: '/products/terra-cup.webp',
    colors: [
      { name: 'Terracota', hex: '#b0654d' },
      { name: 'Arena', hex: '#d6c8b2' }
    ],
    features: ['Hecha a mano', '300 ml de capacidad', 'Apta para lavavajillas'],
    stock: 40
  },
  {
    id: 'p-form-chair',
    slug: 'form-chair',
    name: 'Form Chair',
    category: 'hogar',
    tagline: 'Sillón bajo de roble y bouclé',
    description:
      'Estructura de roble macizo con cojín de bouclé ivory. Un asiento generoso y acogedor que se convierte en el rincón favorito de la casa.',
    price: 6900,
    rating: 4.9,
    reviewCount: 23,
    image: '/products/form-chair.webp',
    colors: [
      { name: 'Marfil', hex: '#e8e0d1' },
      { name: 'Oliva', hex: '#6b6d56' }
    ],
    features: ['Roble macizo', 'Tapizado bouclé', 'Ensamble sin tornillos visibles'],
    badge: 'Hecho a mano',
    stock: 5
  }
];
