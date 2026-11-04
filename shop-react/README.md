# Órbita — Tienda demo en React

E-commerce de demostración construido con React 19, TypeScript y Vite. Forma
parte del portafolio comercial como pieza de exhibición: no procesa pagos ni
envía información a ningún servicio.

> Proyecto independiente. No comparte build, dependencias ni CI con
> `backend/`, `frontend/` (Angular) o `landing/`. Se ejecuta por separado en el
> puerto `4400`.

## Funcionalidad

- **Catálogo** de ocho productos ficticios con búsqueda sin acentos, filtro por
  categoría y ordenamiento. El estado vive en la URL
  (`/?q=...&categoria=...&orden=...`), por lo que se puede compartir o recargar.
- **Detalle de producto** con selector de color, cantidad limitada por stock,
  precio comparativo, características y productos relacionados.
- **Carrito** persistente por producto + color, con cantidades, subtotal, envío
  y umbral de envío gratis.
- **Checkout simulado** con validación de contacto, dirección y pago (tarjeta o
  transferencia). Al confirmar se genera un pedido local y se muestra una
  confirmación que sobrevive a la recarga.
- **Accesibilidad**: enlace de salto, labels y roles, toasts con `aria-live`,
  foco visible y respeto a `prefers-reduced-motion`.

## Requisitos

- Node.js 20+ y npm 10+ (probado con Node 24 y npm 11).

## Comandos

```bash
npm install

npm run dev        # http://localhost:4400
npm run build      # tsc -b + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4400

npm run lint       # ESLint 9 (flat config)
npm run format     # Prettier
npm run format:check
npm test           # Vitest + Testing Library (30 pruebas)
npm run e2e        # Playwright (5 pruebas)
```

La suite E2E levanta el dev server con `webServer` y usa Microsoft Edge en local
(`PLAYWRIGHT_CHANNEL` permite cambiarlo). Con `CI=1` se usa el Chromium incluido
por Playwright.

## Rutas

| Ruta               | Vista                       |
| ------------------ | --------------------------- |
| `/`                | Hero y catálogo filtrable   |
| `/producto/:slug`  | Detalle de producto         |
| `/carrito`         | Carrito y resumen de compra |
| `/checkout`        | Formulario de pago simulado |
| `/pedido/:orderId` | Confirmación del pedido     |

## Arquitectura

```
src/
  app/            App, rutas y managers globales
  models/         Tipos y constantes de producto, carrito, pedido y checkout
  domain/         Cálculos puros del carrito
  data/           Catálogo estático
  services/       Catálogo, pedidos en localStorage y sus pruebas
  features/       catalog, product, cart, checkout, not-found
  shared/         Header, Footer, Toaster y componentes reutilizables
  store/          Zustand: carrito y toasts
  test/           Configuración de Vitest
e2e/              Suite Playwright
public/products/  Imágenes WebP locales
```

Cada feature separa el markup en `components/` y deja la página como punto de
orquestación; los modelos no importan React y los servicios concentran el acceso
a datos o al almacenamiento local.

Decisiones relevantes:

- **Precios puros**: `priceLines` y `calculateTotals` no conocen React ni el
  navegador; el envío gratis se calcula en un solo lugar y se prueba con Vitest.
- **URL como estado del catálogo**: filtros y orden viven en los search params,
  evitando estado duplicado y haciendo las vistas enlazables.
- **Persistencia explícita**: Zustand `persist` guarda solo los datos del
  carrito, sin acciones ni estado derivado.
- **Formularios tipados**: React Hook Form + Zod, con validación condicional de
  los campos de tarjeta según el método de pago.
- **Assets locales**: las nueve imágenes son WebP generados para la demo, sin
  depender de servicios externos.

## Persistencia local

| Clave              | Contenido                                      |
| ------------------ | ---------------------------------------------- |
| `orbita-cart-v1`   | Líneas del carrito (producto, color, cantidad) |
| `orbita-orders-v1` | Últimos 20 pedidos confirmados                 |

Ambas viven en `localStorage` y son por dispositivo. `orbita-orders-v1` permite
recargar o volver a abrir la confirmación de un pedido.

## Alcance de la demo

- No hay backend, autenticación, inventario real ni cobro: el pago es simulado.
- Los pedidos solo existen en el navegador; limpiar el almacenamiento los borra.
- El catálogo es estático, por lo que stock y precios no cambian.
- No se solicita ni transmite información bancaria real.

## Pruebas

Las pruebas unitarias cubren la lógica de precios, el store del carrito, la
búsqueda/orden del catálogo, el esquema de checkout y la interacción de tarjetas
y catálogo. Las E2E recorren el flujo completo: explorar y filtrar, abrir un
producto, comprar de forma simulada, validar formularios, ver el carrito vacío y
navegar por categorías desde el menú móvil (visibilidad, filtrado y header
sticky).
