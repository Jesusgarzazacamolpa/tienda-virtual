# Órbita Admin — Panel de administración

Panel React para gestionar el catálogo y consultar los pedidos de la tienda demo
de `shop-react/`. Consume la API GraphQL de `shop-admin-api/`.

> Proyecto independiente de la API: no comparte build ni dependencias con
> `backend/`, `frontend/`, `landing/`, `shop-react/` ni `shop-admin-api/`.
> Ejecuta el panel en el puerto `4501`.

## Funcionalidad

- **Acceso por token**: el panel guarda el token Bearer por pestaña en
  `sessionStorage` y cierra la sesión cuando la API responde
  `UNAUTHENTICATED`.
- **Catálogo**: listado con búsqueda sin acentos, filtro por categoría y por
  estado, estadísticas de inventario y alta/edición de productos con
  validación en cliente y servidor.
- **Pedidos**: listado con filtro por estado, estadísticas de ingresos y
  detalle de solo lectura con cliente, pago, entrega y líneas.
- **Diseño**: misma identidad visual que la tienda (`ink`/`sand`/`signal`),
  tablas con encabezado fijo, tarjetas en móvil, diálogos con foco contenido,
  toasts y enlace de salto.

## Requisitos

- Node.js 22+ y npm 10+.
- La API de `shop-admin-api/` corriendo en `http://localhost:4500`.

```bash
cd ../shop-admin-api
npm install
npm run dev
```

## Comandos

```bash
npm install

npm run dev        # Vite en http://localhost:4501
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4501

npm run lint
npm run format
npm run format:check
npm run e2e        # 4 pruebas Playwright (levanta API y panel)
```

En desarrollo, Vite reenvía `/graphql` a `http://localhost:4500`, así que el
panel funciona sin CORS. En producción, sirve `dist/` con el servidor web que
prefieras y apunta la API al origen correcto.

La suite E2E levanta la API desde `../shop-admin-api` y el panel con sus
respectivos `dev`, y usa Microsoft Edge en local con el token de desarrollo
(`orbita-admin-dev`). Variables opcionales: `E2E_BASE_URL`
(`http://localhost:4501`) y `PLAYWRIGHT_CHANNEL`. Con `CI=1` se usa el Chromium
de Playwright.

## Configuración

| Variable         | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `VITE_API_URL`   | Endpoint que consume el panel (`/graphql`; se fija al compilar)    |
| `VITE_STORE_URL` | Enlace "Ver tienda" (`http://localhost:4400`; se fija al compilar) |

`VITE_*` se resuelve en tiempo de build: cambia los valores antes de
`npm run build` si el panel apuntará a otro host.

## Autenticación

El panel guarda el token en `sessionStorage` (`orbita-admin-token`), por lo que
la sesión es por pestaña y se pierde al cerrarla. Solo lo envía al endpoint
GraphQL configurado en `VITE_API_URL`.

El token de desarrollo (`orbita-admin-dev`) solo se anuncia en la pantalla de
acceso cuando Vite corre en modo desarrollo. En producción define
`ADMIN_TOKEN` con un valor propio en la API y guárdalo fuera del repositorio.

## Rutas

| Ruta         | Pantalla                                                            |
| ------------ | ------------------------------------------------------------------- |
| `/`          | Acceso con token                                                    |
| `/productos` | Estadísticas, búsqueda, filtros y tabla/tarjetas con alta y edición |
| `/pedidos`   | Estadísticas, filtro por estado y detalle de solo lectura           |

El estado del servidor se consulta con TanStack Query y se invalida tras cada
mutación. El formulario usa React Hook Form + Zod con las mismas reglas que la
API; el stock se edita en el mismo diálogo y el precio anterior acepta vacío.

## Arquitectura

```
src/
  main.tsx            Entrada de React y providers globales
  App.tsx             Rutas del panel
  models/             Tipos de producto y pedido
  services/           Cliente GraphQL
  session/            Provider del token y hook de la API
  features/
    auth/             Acceso por token
    layout/           Sidebar, header móvil y navegación
    products/         Página, tabla, tarjetas y formulario
    orders/           Página, tabla, tarjetas y detalle
  components/         Primitivas compartidas (modal, badge, toast…)
  lib/                Formato de precios/fechas y utilidades
e2e/                  Suite Playwright
public/products/      Imágenes WebP heredadas de la tienda
```

Decisiones relevantes:

- **Una sola fuente de validación**: el formulario replica el esquema Zod de la
  API y el servidor vuelve a validar, por lo que no se puede saltar desde el
  cliente.
- **Sesión por pestaña**: el token vive en `sessionStorage` y las llamadas
  pasan por un único cliente que cierra sesión ante `UNAUTHENTICATED`.
- **Panel responsivo**: tabla con encabezado fijo en escritorio y tarjetas en
  móvil, con navegación por pestañas.
- **UI separada de la lógica**: las páginas orquestan estado y consultas, el
  markup vive en `features/*/components`, los tipos en `models` y el acceso a
  datos en `services`.

## Alcance

- Los pedidos son de solo lectura y provienen de la semilla de la API; no se
  sincronizan con los pedidos guardados en `localStorage` por `shop-react`.
- No hay subida de imágenes: se usa una ruta local `/products/<slug>.webp`.
- No hay usuarios, roles ni auditoría; un único token protege toda la API.
- La API no sirve este panel: ambos proyectos se ejecutan y despliegan por
  separado.
