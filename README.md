# Boilerplate Backoffice

Plantilla base para sistemas B2B: API Spring Boot 3 (Java 21) y frontend Angular 19.

El plan completo y los estándares de la agencia viven en
[`docs/manual_de_desarrollo_y_roadmap.md`](docs/manual_de_desarrollo_y_roadmap.md).

## Estructura

```
backend/     API Spring Boot 3 + Flyway + PostgreSQL
frontend/    Angular 19 standalone + Tailwind CSS (backoffice)
landing/     Angular 19 standalone + Tailwind CSS (sitio corporativo)
shop-react/  React 19 + Vite (tienda demo de portafolio, aislada)
shop-admin/  React 19 + Vite (panel de administración de la tienda)
shop-admin-api/  Node.js + Express + GraphQL + SQLite (API del panel)
docs/        Manual de desarrollo y roadmap
```

## Requisitos

- JDK 21 (Temurin). `JAVA_HOME` debe apuntar al JDK 21.
- Maven 3.9+
- PostgreSQL 16 en `localhost:5432`
- Node.js 22 LTS recomendado y npm 11+. Node 24 funciona con Angular 19, pero
  el CLI lo marca como versión no soportada.

## Base de datos

Crea el usuario y la base una sola vez:

```bash
psql -U postgres -c "CREATE USER backoffice WITH PASSWORD 'backoffice_dev';"
psql -U postgres -c "CREATE DATABASE backoffice OWNER backoffice;"
```

`backoffice_dev` es una credencial local de desarrollo; en otros entornos usa
variables de entorno. Flyway crea el esquema (`users`, `roles`, `user_roles`,
`leads`) al arrancar la aplicación.

## Configuración

Variables de entorno (con valores por defecto entre paréntesis):

| Variable | Descripción |
| --- | --- |
| `DB_URL` | URL JDBC (`jdbc:postgresql://localhost:5432/backoffice`) |
| `DB_USER` | Usuario de PostgreSQL (`backoffice`) |
| `DB_PASSWORD` | Contraseña de PostgreSQL (`backoffice_dev`) |
| `SERVER_PORT` | Puerto HTTP (`8080`) |
| `TRACING_SAMPLING_PROBABILITY` | Muestreo de trazas (`1.0`) |
| `JWT_SECRET` | Clave HMAC para firmar tokens (mínimo 32 bytes) |
| `JWT_EXPIRATION_MINUTES` | Vigencia del token en minutos (`60`) |
| `JWT_ISSUER` | Emisor del token (`backoffice`) |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma (`http://localhost:4200,http://localhost:4300`) |
| `LOCAL_ADMIN_EMAIL` | Email del admin sembrado en perfil `local` (`admin@backoffice.local`) |
| `LOCAL_ADMIN_PASSWORD` | Contraseña del admin local (`Admin123!`) |

Si Maven falla al descargar dependencias con `PKIX path building failed` por la
inspección SSL de un antivirus (AVG en Windows), importa la CA raíz del
antivirus en una copia del truststore del JDK y apunta Maven a esa copia:

```bash
cp "$JAVA_HOME/lib/security/cacerts" "$TEMP/maven-avg-truststore.jks"
keytool -importcert -noprompt -alias avg-root \
  -file "$TEMP/avg-root.cer" \
  -keystore "$TEMP/maven-avg-truststore.jks" -storepass changeit
export MAVEN_OPTS="-Djavax.net.ssl.trustStore=$TEMP/maven-avg-truststore.jks -Djavax.net.ssl.trustStorePassword=changeit"
```

En Windows, si la ruta del truststore contiene espacios, usa la ruta corta 8.3
en `MAVEN_OPTS`. `-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT` no siempre basta.
No modifiques el `cacerts` global del JDK.

Para npm, el error equivalente es `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Exporta la
CA raíz de AVG a `.certs/avg-root-ca.pem` (ignorada por git) y ejecuta:

```bash
export NODE_EXTRA_CA_CERTS="$PWD/.certs/avg-root-ca.pem"
```

## Backend

```bash
cd backend
mvn test
mvn spring-boot:run
```

Para desarrollo local (siembra el usuario admin en la base):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Estructura

```
src/main/java/com/agencia/backoffice/
  auth/       Login, JWT, filtro y seguridad de endpoints
  user/       Usuarios, roles y CRUD administrativo
  lead/       Captación pública desde la landing
  report/     Reportes PDF/XLSX con JasperReports
  config/     CORS, OpenAPI, seguridad y siembra del admin local
  common/
    error/    Errores uniformes, flowCode y traceId
    web/      Paginación, cabeceras y filtro de trazas
    text/     Utilidades de texto compartidas
```

Cada feature agrupa entidad, repositorio, servicio, controlador y DTOs (`dto/`);
la suite de pruebas replica la misma estructura en `src/test`.

### Autenticación

`POST /api/v1/auth/login` y `POST /api/v1/leads` son públicos, junto con
`/actuator/health`. El resto requiere `Authorization: Bearer <token>`.

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@backoffice.local","password":"Admin123!"}'
```

Respuesta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600,
  "user": {
    "id": "a84cd3af-...",
    "email": "admin@backoffice.local",
    "firstName": "Local",
    "lastName": "Admin",
    "roles": ["ADMIN"]
  }
}
```

Las credenciales del admin local (`admin@backoffice.local` / `Admin123!`) solo
existen con el perfil `local`; cámbialas con `LOCAL_ADMIN_EMAIL` y
`LOCAL_ADMIN_PASSWORD`.

### Logs técnicos del login

Cada petición arrastra un `traceId`; el login además registra sus etapas con
`flow=AUTH-LOGIN`. Los fallos agregan el `flowCode` oficial:

```text
INFO  [traceId=...] AuthService - flow=AUTH-LOGIN step=start email=a***@backoffice.local
INFO  [traceId=...] AuthService - flow=AUTH-LOGIN step=validating-credentials email=a***@backoffice.local
INFO  [traceId=...] AuthService - flow=AUTH-LOGIN step=success userId=... roles=[ADMIN]
WARN  [traceId=...] AuthService - flow=AUTH-LOGIN step=failed flowCode=AUTH-001 reason=bad-credentials email=a***@backoffice.local
```

`reason` distingue `bad-credentials`, `account-disabled`, `account-locked` y
`authentication-error` solo en los logs; al cliente siempre se le responde
`AUTH-001` con el mismo mensaje. Las contraseñas y los tokens nunca se
registran, y `logback-spring.xml` enmascara emails, secretos y tarjetas.

### Usuarios

Todos los endpoints requieren rol `ADMIN`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/v1/users?search=&page=0&size=20` | Listado paginado (máximo 100 por página); `search` filtra por email, nombre o apellido y `sort` acepta `createdAt`, `email`, `firstName` o `lastName` |
| `GET` | `/api/v1/users/{id}` | Detalle de un usuario |
| `POST` | `/api/v1/users` | Crea usuario con contraseña y roles |
| `PUT` | `/api/v1/users/{id}` | Actualiza email, nombre, apellido y roles |
| `PATCH` | `/api/v1/users/{id}/status` | Activa o desactiva la cuenta (`enabled`) |

Ejemplo de creación:

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@empresa.com","password":"Secret123!","firstName":"Ana","lastName":"López","roles":["USER"]}'
```

Reglas: el email es único (duplicado → `RES-002`), los roles deben existir
(`ADMIN`, `USER`; desconocido → `VAL-001`), la contraseña requiere 8–72
caracteres y no se permite desactivar la propia cuenta. No hay borrado físico:
las cuentas se desactivan con `enabled: false` para conservar la trazabilidad.

### Reportes

La reportería vive en el módulo `com.agencia.backoffice.report` dentro del
monolito: reutiliza la autenticación, el servicio de usuarios y la misma base de
datos, y mantiene el contrato aislado (controller → service → filas) para poder
extraerlo a un microservicio si algún día lo exige la carga o el despliegue.
Los PDF y XLSX se generan con JasperReports 6.21.3 a partir de plantillas JRXML
en `src/main/resources/reports/`; el XLSX usa Apache POI (`JRXlsxExporter`).

Todos los endpoints requieren rol `ADMIN`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/v1/reports` | Catálogo de reportes disponibles con sus formatos |
| `GET` | `/api/v1/reports/{code}?format=pdf&search=` | Descarga el reporte; `format` acepta `pdf` (por defecto) o `xlsx`, y `search` reutiliza el filtro del listado de usuarios |

Ejemplo:

```bash
curl -OJ "http://localhost:8080/api/v1/reports/users?format=xlsx&search=ana" \
  -H "Authorization: Bearer <token>"
```

La respuesta llega como adjunto (`Content-Disposition`) con nombre
`usuarios-<fecha>-<hora>.<ext>`; CORS expone ese header para que Angular muestre
el nombre real. Un formato no soportado responde `VAL-002` y un código
desconocido `RES-001`. Las plantillas se compilan una vez y se reutilizan.

### Leads (público)

`POST /api/v1/leads` recibe las solicitudes de la landing corporativa. Es
público, no requiere JWT y persiste en la tabla `leads` (migración `V2`).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/v1/leads` | Registra un lead; responde `201` con `{ id, createdAt }` |

```bash
curl -X POST http://localhost:8080/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ana López","email":"ana@empresa.com","company":"Grupo Bajío","challenge":"INTEGRATIONS"}'
```

`challenge` acepta `MODERNIZATION`, `INTEGRATIONS`, `CUSTOM_DEVELOPMENT` o
`STAFF_AUGMENTATION` (desconocido → `VAL-002`). Los campos obligatorios y sus
topes se validan con Bean Validation (`VAL-001`). El campo oculto `website` es
un honeypot anti-bot: si llega lleno, el backend responde `202` sin persistir
nada, de modo que un bot no puede distinguir el descarte de un alta real. El
email se normaliza a minúsculas antes de guardarlo.

### Documentación de la API (Swagger)

Con la aplicación en marcha:

- UI interactiva: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Ambas rutas son públicas. Para probar endpoints protegidos, inicia sesión en
`POST /api/v1/auth/login`, copia el `accessToken` y pégalo en el botón
**Authorize** de Swagger UI.

Cada petición recibe un `traceId` (Micrometer Tracing / Brave) que se incluye en
los logs (`[traceId=...]`), en el cuerpo de los errores y en el header `traceId`
de todas las respuestas, incluidas las que rechaza Spring Security (401/403).
El header es legible desde el navegador porque CORS lo expone. Los rechazos de
seguridad también se registran con `flowCode`, método y ruta.

Formato de error:

```json
{
  "flowCode": "RES-001",
  "message": "El recurso solicitado no existe.",
  "traceId": "6f1c...",
  "timestamp": "2026-11-03T15:30:00Z",
  "details": []
}
```

Los `flowCode` disponibles están en `FlowCode`. El backend nunca devuelve
stacktraces ni mensajes de excepciones inesperadas.

Credenciales inválidas responden `401` con `flowCode: AUTH-001`, una petición
sin token a una ruta protegida también `401` con `AUTH-001`, falta de permisos
`403` con `AUTH-002`, un UUID mal formado `400` con `VAL-002`, una ruta
inexistente `404` con `RES-001` y un método HTTP no permitido `405` con
`VAL-003`.

## Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:4200
npm run build    # dist/frontend
```

Pruebas unitarias (requiere Chrome o Edge Chromium):

```bash
export CHROME_BIN="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
npm test -- --watch=false --browsers=ChromeHeadless
```

### Pruebas E2E

Playwright ejecuta los flujos críticos contra el stack real. Requiere PostgreSQL
local con la base `backoffice` y JDK 21; el `webServer` del config levanta el
backend con perfil `local` (admin sembrado) y Angular automáticamente:

```bash
cd frontend
npm run e2e        # suite headless
npm run e2e:ui     # modo interactivo
npm run e2e:report # abre el último reporte HTML
```

En Windows local la suite usa Microsoft Edge (`channel: msedge`) y no descarga
navegadores. En CI descarga Chromium. Variables opcionales: `E2E_BASE_URL`
(`http://localhost:4200`), `E2E_API_URL` (`http://localhost:8080/api/v1`),
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` y `PLAYWRIGHT_CHANNEL`.

Cobertura E2E:

- Redirección a login sin sesión y respeto del `redirectTo`.
- Login válido, identidad/roles en el topbar, logout y limpieza de sesión.
- Error `AUTH-001` con credenciales inválidas.
- Alta, búsqueda, edición y activación/desactivación optimista de usuarios.
- Conflicto `RES-002` al crear un correo duplicado.
- Descarga del reporte de usuarios en PDF y XLSX (validando la firma del
  archivo) y envío del filtro de búsqueda al endpoint de reportes.

Los artefactos (`playwright-report/`, `test-results/`) quedan ignorados por
git. En fallos se conservan traza, captura y video.

### Integración continua

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) se ejecuta en
push y pull request hacia `main` y `develop`:

| Job | Qué valida |
| --- | --- |
| `backend` | `mvn -B test` con JDK 21 y caché de Maven. |
| `frontend` | `npm ci`, 104 pruebas Karma en ChromeHeadless y build de producción. |
| `landing` | `npm ci`, 12 pruebas Karma en ChromeHeadless y build de producción. |
| `e2e` | PostgreSQL 16 como service container, Chromium de Playwright y las suites E2E del backoffice y la landing. |

El job E2E depende de backend, frontend y landing, usa el perfil `local` con
`admin@backoffice.local` y publica los reportes de Playwright como artefacto si
falla.

### Estructura

```
src/app/
  core/       Servicios singleton, interceptores y guards
  shared/     UX Toolkit reutilizable (componentes standalone)
  features/   Vistas funcionales: auth, layout, users, forms y reports
  app.routes.ts
```

Alias de import disponibles en `tsconfig.json`: `@core/*`, `@shared/*` y
`@features/*`. Las rutas usan `loadComponent` para cargar cada feature en un
chunk independiente. Tailwind CSS 4 se procesa vía PostCSS (`.postcssrc.json`)
y los tokens de marca viven en `src/styles.css`.

### UX Toolkit

Los componentes compartidos se importan desde `@shared/components`:

| Componente | Selector | Qué aporta |
| --- | --- | --- |
| `FormInputComponent` | `app-form-input` | CVA para Reactive Forms, máscaras `digits`/`phone` y errores automáticos (required, email, min/max length). |
| `SearchSelectComponent` | `app-search-select` | CVA tipo combobox con búsqueda incremental, navegación por teclado (flechas, Enter, Escape) y cierre por click fuera. |
| `SmartSearchComponent` | `app-smart-search` | Typeahead con debounce de 300 ms, spinner y botón de limpiar. |
| `DataTableComponent` | `app-data-table` | Columnas tipadas, skeletons al cargar, empty state, acciones por fila con `<ng-template #rowActions>`, encabezado fijo y scroll con barra fina personalizada. |
| `DialogComponent` | `app-dialog` | Diálogo modal con tamaños (`sm`/`md`/`lg`), cierre por Escape, backdrop o botón, scroll bloqueado, foco atrapado y slots para contenido y `dialogFooter`. |
| `SlideOverPanelComponent` | `app-slide-over-panel` | Drawer lateral con backdrop, cierre por Escape y slots para contenido y `panelFooter`. |
| `FileUploaderComponent` | `app-file-uploader` | Drag & drop con validación de extensión (`accept`) y peso (`maxSizeMb`). |
| `EmptyStateComponent` | `app-empty-state` | Estado vacío con título, mensaje y acción opcional. |
| `SkeletonLoaderComponent` | `app-skeleton-loader` | Esqueletos animados configurables por filas y columnas. |

Los orígenes `http://localhost:4200` y `http://localhost:4300` ya están
permitidos por CORS en el backend.

La ruta `/forms` es una galería de referencia con cinco patrones listos para
copiar: alta de cliente (máscaras, select, textarea, toggle, archivo,
autocompletado con `SmartSearch` + `patchValue` y un select con buscador para
elegir ejecutivo), invitación de usuario (radio cards y mensaje), preferencias
(selects, número con límites y switches), carga de información (skeleton con
carga simulada) y diálogo de confirmación para acciones destructivas
(`DialogComponent` con foco atrapado y cierre por Escape/backdrop). El buscador
de empresas abre el formulario y despliega los resultados en un panel absoluto
que se cierra con click fuera o `Escape`; `Enter` no envía el formulario. Los
formularios validan en vivo y simulan el guardado sin llamar al backend.

### Sesión y manejo de errores

`AuthService` gestiona la sesión con Signals (`session`, `user`, `token`,
`roles`, `isAuthenticated`, `isAdmin`). El login llama a
`POST /api/v1/auth/login`, guarda `{ token, expiresAt, user }` en
`localStorage` bajo `backoffice.session` y programa el cierre automático al
expirar el JWT. `logout()` limpia la sesión y el almacenamiento.

`authInterceptor` añade `Authorization: Bearer <token>` solo a peticiones cuyo
URL empieza por la base de la API y nunca a `/auth/`. La base por defecto es
`http://localhost:8080/api/v1`; para cambiarla, sobrescribe el token:

```ts
{ provide: API_BASE_URL, useValue: 'https://api.midominio.com/api/v1' }
```

`errorInterceptor` normaliza cualquier fallo a `ApiError` (`flowCode`,
`message`, `traceId`, `status`, `details`). Usa el `message` del backend
cuando existe; si no, traduce el `flowCode` a español. Los fallos de red se
mapean a `NET-001` y los `GEN-500` incluyen el `traceId` en el mensaje.

### Vistas funcionales

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/login` | Pública | Login con `FormInputComponent`; redirige a `/users` si ya hay sesión. |
| `/users` | `authGuard` | Layout protegido (sidebar + topbar) con listado, búsqueda y paginación. |
| `/reports` | `authGuard` + `ADMIN` | Reportería: catálogo de reportes, filtro de búsqueda y descarga en PDF o XLSX con retroalimentación del nombre generado. |
| `/forms` | `authGuard` | Galería de ejemplos de formularios con el UX Toolkit: autocompletado al inicio del alta, select con buscador, carga con skeleton y diálogo de confirmación. |

`authGuard` envía a `/login?redirectTo=<ruta>` cuando no hay sesión y el login
solo acepta destinos internos que empiecen por `/`. El layout muestra la
identidad y los roles del usuario, adapta el sidebar a móvil y cierra sesión
desde el topbar.

`UserListComponent` carga `GET /users` con búsqueda con debounce y paginación
(10/20/50 filas). El cambio de estado es optimista: la fila se actualiza antes
de la respuesta y se revierte con el mensaje de `ApiError` si el `PATCH` falla.
Los usuarios sin rol `ADMIN` ven un estado de acceso restringido sin llamar a
la API. `UserFormComponent` se monta dentro de `SlideOverPanelComponent` para
crear (con contraseña inicial) o editar (sin contraseña), valida roles y mapea
los `details` de validación del backend a cada campo.

`ReportListComponent` carga el catálogo de `GET /reports` y descarga cada
formato con el filtro vigente. `ReportService` pide el archivo como `Blob` con
`observe: 'response'`, toma el nombre de `Content-Disposition` (con fallback a
`<code>.<formato>`) y el componente dispara la descarga con un object URL
efímero; muestra el nombre confirmado y los errores `flowCode` aunque el
backend responda un JSON dentro de un `Blob`. Los usuarios sin `ADMIN` ven el
mismo estado restringido que en usuarios.

## Landing

El sitio corporativo de Garza Software Partners es un proyecto Angular 19
independiente en `landing/`. No comparte build ni dependencias con el
backoffice: se despliega por separado en el puerto `4300` y consume el endpoint
público de leads del backend.

```bash
cd landing
npm install
npm start        # http://localhost:4300
npm run build    # dist/landing
```

La URL de la API vive en `src/environments/environment.ts`
(`http://localhost:8080/api/v1`); la compilación de producción usa
`environment.production.ts` con la ruta relativa `/api/v1`. Si la landing y la
API quedan en dominios distintos, ajusta ese valor y agrega el origen a
`CORS_ALLOWED_ORIGINS`.

Contenido: hero con propuesta de valor y CTA, tres soluciones, tres casos de
estudio (Reto/Solución/Impacto), marquesina del stack técnico, metodología de
tres pilares y formulario de evaluación. El formulario valida nombre, correo
corporativo (rechaza Gmail, Hotmail, Outlook y similares), empresa y desafío;
envía `POST /api/v1/leads` con honeypot oculto y muestra la confirmación
personalizada o el `message`/`traceId` del backend como "Folio".

Pruebas unitarias (misma variante de Chrome/Edge que el backoffice):

```bash
cd landing
export CHROME_BIN="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
npm test -- --watch=false --browsers=ChromeHeadless
```

La suite E2E usa Playwright con el backend y el dev server de la landing como
`webServer`:

```bash
cd landing
npm run e2e
```

Cubre la propuesta de valor y las secciones principales, el rechazo de correo
gratuito sin llamar a la API, el menú móvil y el alta real de un lead
corporativo (`201`).

## Tienda demo en React

`shop-react/` es un e-commerce ficticio ("Órbita") para portafolio comercial,
construido con React 19, TypeScript, Vite y Tailwind CSS 4. Es un proyecto
aislado: no comparte build ni dependencias con el backoffice o la landing, y no
tiene backend; el pago y los pedidos son simulados y se guardan en
`localStorage`.

```bash
cd shop-react
npm install
npm run dev      # http://localhost:4400
npm test         # 30 pruebas unitarias
npm run e2e      # 5 pruebas Playwright
npm run build
```

Incluye catálogo con búsqueda, filtros y orden sincronizados con la URL, detalle
de producto, carrito persistente por producto y color, checkout validado con
React Hook Form + Zod y confirmación de pedido recargable. Los detalles de
arquitectura y alcance están en
[`shop-react/README.md`](shop-react/README.md).

## Administrador GraphQL de la tienda

El administrador de la tienda se divide en dos proyectos independientes que se
comunican por GraphQL:

- `shop-admin-api/`: API Node.js 22.5+ con Express 5, GraphQL Yoga y SQLite
  (`node:sqlite`), en el puerto `4500`.
- `shop-admin/`: panel React 19 + Vite, en el puerto `4501`.

```bash
cd shop-admin-api
npm install
npm run dev      # API en http://localhost:4500
npm test         # 6 pruebas de la API
npm run build
npm start

cd ../shop-admin
npm install
npm run dev      # panel en http://localhost:4501
npm run e2e      # 4 pruebas Playwright (levanta API y panel)
npm run build
```

La API exige `Authorization: Bearer <token>`; en desarrollo usa
`orbita-admin-dev` (`ADMIN_TOKEN` lo cambia). El panel permite buscar y filtrar
productos, crearlos y editarlos con validación compartida (Zod) y consultar
pedidos con filtro por estado y detalle de solo lectura. GraphiQL está en
`http://localhost:4500/graphql` y la salud en `/health`. Los detalles de
esquema, variables y comandos están en
[`shop-admin-api/README.md`](shop-admin-api/README.md); los del panel, en
[`shop-admin/README.md`](shop-admin/README.md).

## Estado

- Backend Fase 1: arquitectura base, tracing, enmascaramiento de logs, esquema
  Flyway y manejo global de errores.
- Backend Fase 2: entidades JPA, JWT (login, filtro, validación), CORS global,
  rutas stateless y manejo de 401/403 con `flowCode`.
- Backend Fase 3: gestión de usuarios con listado paginado y búsqueda, detalle,
  creación, actualización, activación/desactivación y restricción a `ADMIN`.
- Backend Fase 4: homologación de utilidades (normalización de email, nombres de
  rol y manejadores 401/403), `AuthService` con logs técnicos del login
  (`flow=AUTH-LOGIN`) y `flowCode` en los fallos, header `traceId` en todas
  las respuestas y registro de los rechazos de seguridad.
- Backend revisión final: conflictos de integridad (`RES-002`) y content-type no
  soportado (`VAL-002`) traducidos en `GlobalExceptionHandler`, `sort` validado
  contra una lista permitida en `UserController` (`VAL-002`) y tope global de
  paginación (`spring.data.web.pageable.max-page-size: 100`).
- Backend reportes: módulo `report` dentro del monolito con catálogo y descarga
  del listado de usuarios en PDF/XLSX vía JasperReports, plantillas compiladas
  una vez, filtro por búsqueda y `Content-Disposition` expuesto por CORS.
- Backend leads: endpoint público `POST /api/v1/leads` con validación, honeypot
  anti-bot (`202` descarta sin persistir), normalización de email y tabla
  `leads` creada por la migración `V2`.
- Documentación OpenAPI con springdoc: Swagger UI, esquema Bearer JWT y
  respuestas `flowCode` documentadas por endpoint.
- Frontend Fase 1: Angular 19 standalone, Tailwind CSS 4, estructura
  core/shared/features, rutas lazy con alias de import y pantalla inicial.
- Frontend Fase 2: `AuthService` con Signals y persistencia de sesión,
  `auth.interceptor` (JWT solo hacia la API) y `error.interceptor`
  (traducción de `flowCode` y captura de `traceId`).
- Frontend Fase 3: UX Toolkit con `FormInput`, `SmartSearch`, `DataTable`,
  `SlideOverPanel`, `FileUploader`, `EmptyState` y `SkeletonLoader`.
- Frontend Fase 4: layout protegido, login, listado de usuarios con búsqueda y
  paginación, formulario en slide-over y cambio de estado optimista con
  rollback.
- Frontend Fase 5: suite E2E con Playwright para autenticación y gestión de
  usuarios, y pipeline de CI con jobs de backend, frontend y E2E sobre
  PostgreSQL 16.
- Frontend extra: galería `/forms` con cinco ejemplos, autocompletado con
  `SmartSearch` + `patchValue` al inicio del alta, select con buscador
  (`app-search-select`), carga de información con `SkeletonLoader`, diálogo
  genérico (`app-dialog`) y tabla de usuarios con barra de scroll fina y
  encabezado fijo.
- Reportería frontend: ruta `/reports` con catálogo, filtro por `SmartSearch`,
  descarga PDF/XLSX desde `Blob` y manejo de errores JSON dentro de `Blob` en
  `errorInterceptor`.
- Landing: proyecto aislado en `landing/` (puerto `4300`) con hero, soluciones,
  casos de estudio, stack técnico, metodología y formulario de lead conectado al
  endpoint público, validación de correo corporativo y estados de éxito/error
  con folio. La oferta de IA quedó fuera por ahora: su lugar lo ocupan los
  equipos técnicos dedicados (staff augmentation) y la integración de sistemas.
- Identidad visual compartida: la paleta de la landing (`ink-*` para superficies
  y `signal-*`/sky para acentos) se adoptó en el backoffice. Los tokens viven en
  `frontend/src/styles.css`, la escala `brand-*` se remapeó a sky y el body usa
  `bg-ink-950`, por lo que login, layout, tablas, diálogos y slide-overs
  comparten el mismo lenguaje visual.
- Tienda demo: proyecto aislado en `shop-react/` (puerto `4400`) con React 19,
  Vite, TypeScript estricto, Tailwind CSS 4 y Zustand. Catálogo filtrable por
  URL, carrito persistente, checkout simulado con RHF + Zod y confirmación
  recargable; 30 pruebas unitarias y 5 E2E, incluida la navegación móvil.
- Administrador de la tienda: dos proyectos aislados que se comunican por
  GraphQL. `shop-admin-api/` (Node.js 22.5+, Express 5 y GraphQL Yoga) tiene
  persistencia real en SQLite vía `node:sqlite`, semilla de ocho productos y
  cuatro pedidos y 6 pruebas de API. `shop-admin/` es un panel React 19 con
  acceso por token Bearer, estadísticas, búsqueda/filtros, alta y edición de
  productos con validación Zod compartida, pedidos de solo lectura y 4 E2E,
  incluida la vista móvil.
- Verificado: 58 pruebas backend, 104 unitarias frontend, 12 unitarias de la
  landing, 30 unitarias de `shop-react`, 6 de API de `shop-admin-api` y 25 E2E (12
  del backoffice, 4 de la landing, 5 de la tienda y 4 del administrador) en
  verde; builds de producción sin errores ni warnings de CSS; flujo real contra
  PostgreSQL sin errores de consola. El workflow de CI queda listo para
  ejecutarse al publicar el repositorio en GitHub.
- Roadmap frontend completado (Fases 1–5); la siguiente iteración queda por
  definir.
