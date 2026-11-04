# Órbita Admin — API GraphQL

API GraphQL en Node.js para administrar el catálogo y los pedidos de la tienda
demo de `shop-react/`, con persistencia real en SQLite.

> Proyecto independiente del panel React (`shop-admin/`): no comparte build ni
> dependencias con la tienda, el backoffice, la landing o el panel. Escucha en
> el puerto `4500`.

## Funcionalidad

- **Autenticación por token**: las consultas y mutaciones exigen
  `Authorization: Bearer <token>`. El token se valida con una comparación de
  tiempo constante.
- **Catálogo**: listado con búsqueda sin acentos y filtros por categoría y
  estado, alta y edición de productos con validación Zod.
- **Pedidos**: listado con filtro por estado y detalle de solo lectura con
  cliente, pago, entrega y líneas.
- **Persistencia**: SQLite creado en `data/orbita-admin.db`, con semilla de
  ocho productos y cuatro pedidos cuando el catálogo está vacío.

## Requisitos

- Node.js **22.5+** (usa el módulo nativo `node:sqlite`; probado con Node 24).
- npm 10+.

## Comandos

```bash
npm install

npm run dev        # API con recarga en caliente en http://localhost:4500
npm run build      # compila a dist/
npm start          # ejecuta la API compilada

npm run lint
npm run format
npm run format:check
npm test           # 6 pruebas de la API con node:test
```

El panel React vive en `../shop-admin/` y se conecta a esta API por
`http://localhost:4500/graphql`.

## Configuración

| Variable        | Descripción                                                        |
| --------------- | ------------------------------------------------------------------ |
| `PORT`          | Puerto de la API (`4500`)                                          |
| `ADMIN_TOKEN`   | Token Bearer exigido por la API (`orbita-admin-dev` en desarrollo) |
| `ADMIN_ORIGIN`  | Origen permitido por CORS (`http://localhost:4501`)                |
| `ADMIN_DB_PATH` | Ruta del archivo SQLite (`data/orbita-admin.db`)                   |

## Autenticación

La API compara el header con `ADMIN_TOKEN` usando `timingSafeEqual`. Sin token
o con un token incorrecto responde un error GraphQL con
`extensions.code = "UNAUTHENTICATED"`; el panel cierra la sesión al recibirlo.

El token de desarrollo (`orbita-admin-dev`) es el valor por defecto. En
producción define `ADMIN_TOKEN` con un valor propio y guárdalo fuera del
repositorio.

## GraphQL

- Endpoint: `POST http://localhost:4500/graphql`
- GraphiQL: `http://localhost:4500/graphql` en el navegador
- Salud: `GET http://localhost:4500/health`

Esquema resumido:

```graphql
enum Category {
  AUDIO
  CALZADO
  ACCESORIOS
  HOGAR
}
enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
enum PaymentMethod {
  CARD
  TRANSFER
}

type Query {
  products(search: String, category: Category, active: Boolean): [Product!]!
  product(id: ID!): Product
  orders(status: OrderStatus): [Order!]!
  order(id: ID!): Order
}

type Mutation {
  createProduct(input: ProductInput!): Product!
  updateProduct(id: ID!, input: ProductInput!): Product!
}
```

Todas las operaciones requieren el header `Authorization: Bearer <token>`.

Consulta de ejemplo:

```bash
curl -s http://localhost:4500/graphql \
  -H "Authorization: Bearer orbita-admin-dev" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(search: \"aura\") { id name price stock active } }"}'
```

Alta de ejemplo:

```bash
curl -s http://localhost:4500/graphql \
  -H "Authorization: Bearer orbita-admin-dev" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation ($input: ProductInput!) { createProduct(input: $input) { id slug } }",
    "variables": {
      "input": {
        "name": "Lámpara Nova",
        "category": "HOGAR",
        "price": 1290,
        "stock": 12,
        "tagline": "Luz cálida para escritorios compactos",
        "description": "Lámpara de mesa con brazo articulado y luz regulable.",
        "image": "/products/halo-one.webp",
        "colors": [{ "name": "Arena", "hex": "#d8cbb8" }],
        "active": true
      }
    }
  }'
```

Reglas de validación (Zod):

- Nombre de 2–80 caracteres; precio mayor a 0 y hasta 1 000 000.
- `compareAtPrice`, si existe, debe ser mayor que `price`.
- Stock entero entre 0 y 10 000; entre 1 y 6 colores por producto.
- `tagline` de 5–120 caracteres y descripción de 10–1000.
- `image` debe apuntar a un WebP local como `/products/halo-one.webp`.
- Cada color necesita nombre y hexadecimal (`#1f2328`).

El slug se genera del nombre y es inmutable: si ya existe se agrega un sufijo
numérico (`-2`, `-3`…). Los errores de validación responden
`extensions.code = "BAD_USER_INPUT"` con `issues` por campo.

## Datos

SQLite se crea en `data/orbita-admin.db` (ignorado por git) con `PRAGMA
user_version = 1`, claves foráneas activas y modo WAL. Si el catálogo está
vacío, se siembran ocho productos y cuatro pedidos de demostración.

| Tabla         | Contenido                                                      |
| ------------- | -------------------------------------------------------------- |
| `products`    | Producto, categoría, precios, stock, colores (JSON), estado    |
| `orders`      | Folio, fecha, entrega estimada, cliente, pago y totales        |
| `order_items` | Líneas del pedido (producto, color, cantidad, precio unitario) |

Para reiniciar la demo, detén la API y borra `data/orbita-admin.db`; se vuelve
a sembrar al arrancar.

## Arquitectura

```
src/
  index.ts          Arranque, puerto y apagado ordenado
  app.ts            Express + Yoga, CORS y /health
  db/
    database.ts     Apertura, migración y semilla
    seed-data.ts    Catálogo y pedidos de demostración
  models/
    types.ts        Producto, pedido y enums compartidos
  services/
    auth.ts         Lectura y comparación del token
    product-repository.ts  Consultas y escrituras de productos
    order-repository.ts    Consultas de pedidos
  graphql/
    schema.ts       Composición del schema
    type-defs.ts    SDL
    resolvers.ts    Resolvers y autorización
    context.ts      Contexto autenticado
    validation.ts   Esquema Zod del producto
    schema.test.ts  Pruebas de la API
```

Decisiones relevantes:

- **Validación en el servidor**: el panel replica el esquema Zod, pero la API
  vuelve a validar, por lo que no se puede saltar desde el cliente.
- **SQLite sin ORM**: consultas preparadas con `node:sqlite`; suficiente para
  una demo con persistencia real y sin dependencias nativas.
- **Solo API**: el servidor no sirve el panel; el frontend se ejecuta y se
  despliega por separado.
- **Separación por capas**: `graphql`, `services`, `models` y `db` mantienen
  los resolvers delgados y el acceso a datos fuera del transporte.

## Pruebas

```bash
npm test
```

Seis pruebas con `node:test` sobre una base en memoria: rechazo sin token,
listado y búsqueda, alta con slug duplicado, validación de datos, edición y
pedidos con filtro y detalle.

## Alcance

- Los pedidos son de solo lectura y provienen de la semilla; no se sincronizan
  con los pedidos guardados en `localStorage` por `shop-react`.
- No hay subida de imágenes: se usa una ruta local `/products/<slug>.webp`.
- No hay usuarios, roles ni auditoría; un único token protege toda la API.
- La autenticación por token fijo es apta para una demo local, no para
  producción; ahí convendría un proveedor de identidad y tokens de corta vida.
