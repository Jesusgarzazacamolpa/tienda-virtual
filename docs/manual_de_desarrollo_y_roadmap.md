# Manual de Desarrollo y Roadmap: Boilerplate Backoffice

Este documento define los estándares técnicos, de calidad de experiencia y el checklist de tareas para construir la plantilla base (Boilerplate) de nuestra agencia para sistemas B2B.

---

## 🛠️ PARTE 1: Estándares y Buenas Prácticas de la Agencia

### 1. Control de Versiones (Git Flow Simplificado)
*   `main`: Producción (Código inmaculado). Solo recibe merges desde `develop`.
*   `develop`: Staging (Entorno de pruebas interno y para el cliente).
*   `feature/nombre-tarea`: Para nuevos desarrollos (ej. `feature/jwt-auth`).
*   `hotfix/nombre-error`: Para corregir bugs críticos en producción.

### 2. Buenas Prácticas Backend (Java 21 + Spring Boot 3)
*   **Package by Feature:** Agrupar clases por dominio de negocio (`user`, `auth`) y no por capas tecnológicas (`controllers`, `services`).
*   **Manejo de Errores (Flow Codes):** El backend NUNCA regresa stacktraces al cliente. Toda excepción se mapea a un código de flujo (ej. `AUTH-001`) y un mensaje general.
*   **Trazabilidad (Trace ID):** Implementar **Micrometer Tracing (Brave)**. Cada petición HTTP generará un `traceId` único que viajará por todo el ecosistema y se adjuntará en los errores.
*   **Seguridad de Logs:** Configurar expresiones regulares (Regex) en `logback-spring.xml` para **enmascarar** contraseñas, tokens y tarjetas en los logs técnicos (ej. `email=j***@mail.com`).

### 3. Experiencia de Usuario (UX) - Frontend Angular 19
*   **Cero Mensajes Técnicos:** El frontend traduce el `flowCode` en mensajes intuitivos y accionables. En caso de fallas críticas (Error 500), se muestra un mensaje de soporte junto con el `traceId` para que el usuario pueda reportarlo.
*   **Optimistic UI:** En acciones de bajo riesgo (ej. cambiar un estatus activo/inactivo), la interfaz asume el éxito y se actualiza de inmediato. Se hace rollback solo si el backend rechaza la petición.
*   **Skeleton Loaders sobre Spinners:** Prohibido bloquear toda la pantalla con un spinner. Utilizar siempre "esqueletos" parpadeantes para simular el contenido que está por cargar.
*   **Empty States (Estados Vacíos):** Nunca mostrar una tabla o pantalla en blanco. Si no hay datos, mostrar una ilustración y un botón principal de "Crear nuevo".
*   **Prevención de Errores (Wrappers):** Todos los inputs deben utilizar el componente genérico de la agencia para validar formato en tiempo real e inyectar máscaras (input masks) automáticamente.

### 4. Experiencia del Cliente Empresarial (CX de la Agencia)
*   **Garantía Cero Bugs:** Ejecución de pruebas automatizadas (E2E) en flujos críticos antes de publicar avances en Staging.
*   **Transparencia de Infraestructura:** Compartir tableros de salud de los sistemas (Uptime/Grafana) con el cliente para generar confianza en la disponibilidad de sus servicios.

---

## 📋 PARTE 2: Roadmap de Tareas - Backend (Spring Boot)

### Fase 1: Arquitectura Base, Trazabilidad y BD
- [x] 1. Inicializar Spring Boot 3 con Java 21 (Web, Data JPA, Security, PostgreSQL, Validation, Flyway).
- [x] 2. Agregar dependencias `micrometer-tracing-bridge-brave` para gestión de Trace IDs.
- [x] 3. Configurar enmascaramiento de datos sensibles en `logback-spring.xml`.
- [x] 4. Escribir script Flyway `V1__init_schema.sql` (users, roles, user_roles con UUIDs).
- [x] 5. Implementar `GlobalExceptionHandler` configurado para atrapar excepciones e inyectar el `traceId` y el `flowCode`.

### Fase 2: Seguridad y Autenticación (JWT)
- [x] 1. Crear Entidades JPA (`User`, `Role`) con inmutabilidad en DTOs (`records`).
- [x] 2. Implementar `JwtService`, `JwtAuthenticationFilter` y `CustomUserDetailsService`.
- [x] 3. Configurar `SecurityFilterChainConfig` (CORS global, rutas stateless).
- [x] 4. Crear `AuthController` con endpoint de login estandarizado.

### Fase 3: Módulos Core
- [x] 1. Crear `UserController` y `UserService` para gestión integral de usuarios.

### Fase 4: Observabilidad y Homologación (Backend)
- [x] 1. Centralizar la normalización de emails (`Emails`) y el mapeo de nombres de rol (`RoleNames`).
- [x] 2. Unificar los handlers de 401/403 en `RestSecurityErrorHandler` y renombrar la proyección de login a `AuthenticatedUser`.
- [x] 3. Extraer `AuthService` y registrar logs técnicos del login (`flow=AUTH-LOGIN`) con `flowCode` y motivo en los fallos.
- [x] 4. Exponer el `traceId` en el header `traceId` de todas las respuestas, incluidas las generadas por Spring Security, y registrarlas con `flowCode`, método y ruta.
- [x] 5. Revisión final: mapear `DataIntegrityViolationException` a `RES-002`, content-type no soportado a `VAL-002`, validar `sort` contra las propiedades permitidas en `UserController` y limitar la paginación con `spring.data.web.pageable.max-page-size: 100`.

### Fase 5: Reportería (Backend)
- [x] 1. Decidir que la reportería vive como módulo `report` dentro del monolito (reutiliza auth, usuarios y BD; contrato aislado para extraerlo después si hace falta).
- [x] 2. Integrar JasperReports 6.21.3 (con ECJ y Apache POI) excluyendo `jackson-dataformat-xml` para no romper la negociación JSON de la API.
- [x] 3. Crear la plantilla `reports/users.jrxml` con encabezado, pie con paginación, total de registros y mensaje de "sin resultados".
- [x] 4. Implementar `ReportService`, `ReportController`, `ReportFormat` y DTOs: catálogo `GET /api/v1/reports` y descarga `GET /api/v1/reports/{code}?format=pdf|xlsx&search=`, restringidos a `ADMIN`.
- [x] 5. Compilar plantillas una vez y reutilizarlas; exportar PDF (`JRPdfExporter`) y XLSX (`JRXlsxExporter` con cell type y sin márgenes de página).
- [x] 6. Exponer `Content-Disposition` por CORS para que Angular lea el nombre del archivo.
- [x] 7. Pruebas de servicio (firmas `%PDF-`/`PK`, catálogo, errores) y de controller (headers, códigos `VAL-002`/`RES-001`).

### Fase 6: Leads del sitio corporativo (Backend)
- [x] 1. Crear la migración `V2__leads.sql` con la tabla `leads` y su índice por fecha.
- [x] 2. Implementar `Lead`, `LeadRepository`, `LeadService` y `LeadController` con `POST /api/v1/leads` público.
- [x] 3. Validar nombre, email, empresa y desafío con Bean Validation; normalizar el email y mapear desafíos desconocidos a `VAL-002`.
- [x] 4. Agregar honeypot (`website`): si llega lleno responde `202` sin persistir, sin revelar el descarte.
- [x] 5. Permitir el origen `http://localhost:4300` por CORS y cubrir controller/servicio con pruebas.

---

## 📋 PARTE 3: Roadmap de Tareas - Frontend (Angular)

### Fase 1: Base y Configuración Inicial
- [x] 1. Generar proyecto Angular 19 (`--standalone`) y configurar TailwindCSS.
- [x] 2. Definir estructura de carpetas (core, shared, features) en `app.routes.ts`.

### Fase 2: Seguridad e Interceptores
- [x] 1. Configurar `auth.interceptor.ts` (para envío de JWT).
- [x] 2. Configurar `error.interceptor.ts` (Traducción de flowCodes y captura de traceIds).
- [x] 3. Crear `AuthService` para gestión de sesión usando *Signals*.

### Fase 3: Construcción del "UX Toolkit" (Componentes Compartidos)
- [x] 1. **`FormInputComponent`:** Wrapper genérico para inputs (maneja estados de error y validaciones automáticas).
- [x] 2. **`SmartSearchComponent`:** Búsqueda predictiva (Typeahead) con *debounce* de 300ms y micro-spinner.
- [x] 3. **`DataTableComponent`:** Tabla de datos inteligente, lista para inyectar *skeletons* y *empty states*.
- [x] 4. **`SlideOverPanelComponent`:** Panel lateral tipo "Drawer" para formularios limpios, evitando pop-ups obstructivos.
- [x] 5. **`FileUploaderComponent`:** Zona Drag & Drop con validación de peso y extensión desde el navegador.
- [x] 6. **`EmptyStateComponent` / `SkeletonLoaderComponent`:** Para retroalimentación visual al usuario en peticiones asíncronas.
- [x] 7. **`SearchSelectComponent`:** Combobox con búsqueda incremental respaldado por `ControlValueAccessor`, navegación por teclado y cierre por click fuera.
- [x] 8. **`DialogComponent`:** Diálogo modal genérico con tamaños, cierre por Escape/backdrop/botón, scroll bloqueado, foco atrapado y slots para contenido y `dialogFooter`.

### Fase 4: Vistas Funcionales (Features)
- [x] 1. Maquetar y conectar el Layout Principal (Sidebar, Topbar).
- [x] 2. Ensamblar `LoginComponent` utilizando el nuevo `FormInputComponent`.
- [x] 3. Construir `UserListComponent` utilizando el `DataTableComponent`, `SmartSearchComponent` y flujos de Optimistic UI.
- [x] 4. Construir `UserFormComponent` desplegado dentro del `SlideOverPanelComponent`.
- [x] 5. Crear la galería `/forms` con cinco ejemplos usando Reactive Forms y el UX Toolkit: alta de cliente (SmartSearch al inicio del formulario, select con búsqueda para ejecutivo, máscaras, archivo), invitación de usuario, preferencias, carga de información con `SkeletonLoader` y simulación de latencia, y diálogo de confirmación para acciones destructivas con `DialogComponent`. El autocompletado llena el formulario con `patchValue`, cierra por click fuera o `Escape` y bloquea `Enter` para no enviar.

### Fase 5: Calidad y CI (transversal)
- [x] 1. E2E con Playwright para login, guard de rutas, CRUD de usuarios, búsqueda y Optimistic UI.
- [x] 2. Pipeline de GitHub Actions con jobs de tests backend, tests/build frontend y E2E contra PostgreSQL 16.
- [x] 3. Configuración reproducible del stack E2E (`webServer`, perfil `local` y admin semilla).
- [x] 4. Cobertura E2E de la galería `/forms` (autocompletado, select con búsqueda, carga con skeleton y diálogo de confirmación) y pulido del scroll de tablas (barra fina personalizada y encabezado fijo).
- [x] 5. Cobertura E2E de reportería: descarga PDF/XLSX validando la firma del archivo y envío del filtro `search` al endpoint.

### Fase 6: Reportería (Frontend)
- [x] 1. Crear `ReportService` y modelos (`ReportFormat`, `ReportDefinition`, `DownloadedReport`): catálogo y descarga como `Blob` con `observe: 'response'`.
- [x] 2. Leer el nombre del archivo desde `Content-Disposition` (UTF-8 y fallback) y disparar la descarga con un object URL efímero.
- [x] 3. Extender `errorInterceptor` para parsear respuestas de error JSON dentro de un `Blob`, conservando `flowCode` y `traceId`.
- [x] 4. Construir `ReportListComponent` en `/reports` con `SmartSearch`, skeleton, empty state, alertas de error/éxito y botones por formato; acceso restringido sin `ADMIN`.
- [x] 5. Agregar la entrada "Reportería" al sidebar y pruebas unitarias de servicio, componente e interceptor.

---

## 📋 PARTE 4: Landing Corporativa (proyecto aislado)

Decisión: la landing de **Garza Software Partners** vive en `landing/` como
proyecto Angular independiente del backoffice, con su propio build, puerto
(`4300`) y despliegue. No comparte sesión, rutas ni dependencias con el
backoffice; solo consume el endpoint público de leads del backend.

### Fase 1: Proyecto aislado
- [x] 1. Generar la app Angular 19 standalone con Tailwind CSS 4, alias `@app/*` y puerto `4300`.
- [x] 2. Configurar `environment.ts` (`http://localhost:8080/api/v1`) y `environment.production.ts` (`/api/v1`).
- [x] 3. Definir tokens de marca, utilidades (grid, glow, gradiente, marquesina) y componentes `Button`/`SectionHeading` en `styles.css`.

### Fase 2: Contenido y diseño
- [x] 1. Navbar sticky con menú móvil y footer corporativo.
- [x] 2. Hero con propuesta de valor, CTAs y mockup de dashboard operativo.
- [x] 3. Secciones de soluciones, casos de estudio, stack técnico y metodología con el copywriting oficial.
- [x] 4. Sección de contacto con formulario y panel lateral de garantías.

### Fase 3: Formulario real y calidad
- [x] 1. `LeadService` + modelos y `corporateEmailValidator` (bloquea Gmail, Hotmail, Outlook y similares).
- [x] 2. `LeadFormComponent` con Reactive Forms, honeypot, estado de envío, éxito personalizado y errores `message`/`traceId` como "Folio".
- [x] 3. Pruebas unitarias (componente, servicio y validador) y E2E de Playwright (secciones, menú móvil, rechazo de correo gratuito y alta real `201`).
- [x] 4. Job `landing` en CI (Karma + build) y suite E2E dentro del job `e2e` sobre PostgreSQL 16.

### Fase 4: Identidad visual compartida
- [x] 1. Retirar por ahora el enfoque de IA de la landing y reemplazarlo por equipos técnicos dedicados (staff augmentation) e integración de sistemas, incluyendo un caso del sector retail.
- [x] 2. Ajustar el reto de lead `AI` → `INTEGRATIONS` en backend, modelo del frontend, pruebas y documentación.
- [x] 3. Llevar la paleta de la landing al backoffice: tokens `ink-*`/`signal-*` en `frontend/src/styles.css`, escala `brand-*` remapeada a sky y superficies base en `bg-ink-950`/`bg-ink-900`.
- [x] 4. Verificado: 58 pruebas backend, 104 unitarias del backoffice, 12 unitarias de la landing y 4 E2E de la landing en verde; revisión visual de login, usuarios, reportería, formularios y landing.