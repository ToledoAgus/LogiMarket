# LogiMarket - Estado del proyecto

> Documento vivo. Actualizar en cada cambio relevante sin borrar el historial de la
> sección "Registro de estado".

**Última actualización:** 2026-06-20  
**Fase:** Sprint 3 cerrado (catálogo transaccional); Sprint 4 parcialmente cubierto
**Estado general:** Catálogo B2B con auth, precios privados, carrito local, checkout y WhatsApp
**Fuente de requisitos:** `PROJECT_BRIEF_LOGIMARKET.md`

## 1. Alcance confirmado

LogiMarket será una plataforma web B2B mobile first para catálogo, precios privados,
pedidos, inventario, promociones y gestión comercial. El MVP se ejecutará localmente
con Supabase desde el inicio y quedará preparado para Vercel. El catálogo, las
categorías, marcas, productos, imágenes, promociones y disponibilidad serán públicos;
precios, carrito persistido, checkout e historial requerirán autenticación.

El diseño contempla desde el primer día aislamiento por empresa, aunque el MVP opere
con una única organización. Esto evita una migración estructural costosa al evolucionar
a SaaS multiempresa.

## 2. Arquitectura general

### Aplicación

- **Web:** Next.js 15 con App Router, React Server Components por defecto, TypeScript
  estricto, Tailwind CSS y componentes Shadcn UI accesibles.
- **Backend:** Supabase PostgreSQL, Auth, Storage y Row Level Security. Las mutaciones
  se ejecutan mediante Server Actions o Route Handlers validados; el navegador usa el
  cliente Supabase solo cuando necesita sesión o tiempo real.
- **Despliegue:** Vercel para la aplicación y Supabase administrado para datos, Auth y
  archivos. GitHub será el origen y habilitará CI y previews.
- **Integraciones:** WhatsApp mediante enlace `wa.me` generado en servidor; PDF mediante
  endpoint dinámico protegido que renderiza catálogo según la sesión.
- **Observabilidad:** logs estructurados sin PII, Vercel Analytics/Speed Insights y una
  solución de errores (Sentry u OpenTelemetry) antes de producción.

### Límites y flujo

```text
Browser
  -> Next.js App Router
     -> Server Components (lecturas cacheables)
     -> Server Actions / Route Handlers (mutaciones y PDF)
        -> Supabase SSR client (sesión del usuario)
        -> Supabase service client (solo trabajos administrativos controlados)
           -> PostgreSQL + RLS
           -> Storage + políticas
           -> Auth
```

Principios: dominio organizado por funcionalidad, autorización en profundidad (UI,
servidor y RLS), importes monetarios en enteros de centavos, snapshots en pedidos,
operaciones críticas transaccionales y ninguna clave de servicio expuesta al cliente.

## 3. Estructura de carpetas objetivo

```text
logimarket/
|-- src/
|   |-- app/
|   |   |-- (public)/                 # Home, catálogo, productos, PDF público
|   |   |-- (auth)/                   # Login, registro y recuperación
|   |   |-- (customer)/               # Carrito, checkout y pedidos del cliente
|   |   |-- admin/                    # Backoffice protegido por rol
|   |   |-- api/                      # Webhooks y endpoints no cubiertos por actions
|   |   `-- layout.tsx
|   |-- components/
|   |   |-- ui/                       # Shadcn, sin lógica de dominio
|   |   |-- layout/
|   |   `-- shared/
|   |-- features/                     # Catálogo, carrito, pedidos, CRM, inventario...
|   |   `-- <feature>/{components,actions,queries,schemas,types}.ts
|   |-- lib/
|   |   |-- supabase/{client,server,admin,middleware}.ts
|   |   |-- auth/                     # Guardas y permisos
|   |   |-- env.ts                    # Variables validadas
|   |   |-- money.ts
|   |   `-- errors.ts
|   |-- config/                       # Navegación, marca y flags
|   `-- types/database.generated.ts
|-- public/
|-- supabase/
|   |-- migrations/                   # SQL versionado, esquema y RLS
|   |-- seed.sql                      # Datos iniciales repetibles
|   `-- config.toml
|-- tests/{unit,integration,e2e}/
|-- .github/workflows/
|-- DECISION_LOG.md
|-- PROJECT_STATE.md
`-- ROADMAP.md
```

Las carpetas se crearán de forma incremental; no se añadirán módulos vacíos.

## 4. Modelo de datos

Todas las entidades de negocio usan UUID, `organization_id`, `created_at` y
`updated_at`, salvo tablas globales o de unión donde no corresponda. Las bajas de
catálogo serán lógicas (`is_active`/`archived_at`) para conservar historial.

### Identidad y tenencia

| Entidad | Propósito y campos relevantes |
|---|---|
| `organizations` | Tenant: `name`, `slug`, datos comerciales, WhatsApp, moneda, zona horaria. |
| `profiles` | Extensión 1:1 de `auth.users`: nombre, apellido, teléfono, rol global de plataforma si se incorpora. |
| `organization_members` | Membresía y rol `customer`, `subadmin`, `admin`; estado e invitación. Restricción única usuario/organización. |
| `customers` | Ficha CRM ligada opcionalmente a `profile_id`: comercio, titular, contacto, dirección, zona y estado. |
| `customer_addresses` | Direcciones reutilizables, tipo y predeterminada. |

El visitante no se almacena como rol: es cualquier sesión anónima. Los permisos de
cliente y administración provienen de `organization_members`, no de metadata editable
por el usuario.

### Catálogo y precios

| Entidad | Propósito y campos relevantes |
|---|---|
| `brands` | Marca, slug, logo, estado; nombre único por tenant. |
| `categories` | Árbol ilimitado por `parent_id`, nombre, slug, orden y estado. Se impiden ciclos mediante trigger. |
| `products` | SKU interno, nombre, descripción, marca, categoría, unidad, mínimo, destacados, estado y métricas. |
| `product_images` | Rutas de Storage, texto alternativo, orden y principal. |
| `inventory` | Stock actual, reservado, umbral bajo y estado calculable por producto. |
| `inventory_movements` | Libro inmutable de entradas, salidas, reservas, ajustes y referencia de origen. |
| `price_lists` | Lista por segmento/cliente, moneda, vigencia, prioridad y estado. |
| `product_prices` | Producto + lista + presentación (`unit`, `box`, `display`, `bulk`), importe en centavos, unidades incluidas y vigencia. |
| `price_history` | Auditoría inmutable de precio anterior/nuevo, actor, motivo y fecha. |
| `promotions` | Tipo, etiqueta, descuento, vigencia, reglas JSON validadas, prioridad y estado. |
| `promotion_products` | Productos de una promoción, cantidad y rol dentro de combos. |

### Compra y operación

| Entidad | Propósito y campos relevantes |
|---|---|
| `carts` / `cart_items` | Carrito activo por cliente, presentación, cantidad, observaciones; total siempre recalculado en servidor. |
| `orders` | Número legible, cliente, estado, moneda, importes, contacto/dirección snapshot, observaciones y fechas. |
| `order_items` | Snapshot de SKU, nombre, presentación, cantidad, precio, descuento e impuestos al confirmar. |
| `order_status_history` | Transiciones inmutables con actor, fecha y comentario. |
| `product_views` | Eventos mínimos para ranking, con retención y anonimización definidas antes de activar. |
| `audit_logs` | Cambios administrativos sensibles, actor, recurso, acción y diff JSON sin secretos. |

### Relaciones principales

```text
organizations 1--N organization_members N--1 profiles/auth.users
organizations 1--N customers 0..1--1 profiles
categories 1--N categories
brands 1--N products N--1 categories
products 1--N product_images
products 1--1 inventory 1--N inventory_movements
price_lists 1--N product_prices N--1 products
promotions N--N products
customers 1--N orders 1--N order_items N--1 products
orders 1--N order_status_history
```

## 5. Esquema Supabase y convenciones

- Esquema público versionado exclusivamente con migraciones en `supabase/migrations`.
- UUID con `gen_random_uuid()`; timestamps `timestamptz`; dinero `bigint` en centavos;
  moneda ISO 4217; teléfonos normalizados E.164; slugs e índices únicos por tenant.
- Enums iniciales: `member_role`, `membership_status`, `customer_status`,
  `price_kind`, `order_status`, `inventory_movement_kind`, `promotion_kind`.
- Funciones `security definer` pequeñas, con `search_path` fijo y privilegios revocados:
  `is_member`, `has_role`, generación de número de pedido y checkout transaccional.
- Triggers para `updated_at`, creación idempotente de perfil, historial de precios,
  movimientos de stock, auditoría y prevención de ciclos de categorías.
- Índices por `organization_id`, claves foráneas, estados/vigencias y búsqueda con
  `pg_trgm`/índice GIN cuando el volumen lo justifique.
- Storage: buckets `product-images` (lectura pública, escritura admin) y
  `organization-assets` (lectura según uso, escritura admin). Se guardan rutas, no URLs.
- Tipos TypeScript generados desde el esquema; nunca mantenidos manualmente.

## 6. Autenticación, roles y permisos

Supabase Auth usará email + contraseña en el MVP, confirmación de email, recuperación
de contraseña y cookies SSR con `@supabase/ssr`. El middleware solo refresca sesiones;
la autorización real ocurre en las consultas y RLS. El registro crea `profiles` y una
solicitud/membresía de cliente pendiente o activa según la política comercial. No se
guardan roles autorizantes en `user_metadata`.

| Capacidad | Visitante | Cliente | Subadmin | Admin |
|---|:---:|:---:|:---:|:---:|
| Ver catálogo, promociones y disponibilidad | Sí | Sí | Sí | Sí |
| Ver precios vigentes aplicables | No | Sí | Sí | Sí |
| Gestionar carrito y crear pedido propio | No | Sí | Sí* | Sí* |
| Ver pedidos propios | No | Sí | Sí | Sí |
| Gestionar pedidos/clientes/stock del tenant | No | No | Sí | Sí |
| Gestionar catálogo, precios, promociones y miembros | No | No | No | Sí |
| Configuración completa del tenant | No | No | No | Sí |

`*` Solo cuando el usuario administrativo también esté asociado a una ficha cliente;
no es un permiso implícito del rol.

### Matriz RLS resumida

- Catálogo activo: `SELECT` para `anon` y `authenticated`; columnas sensibles no viven
  en vistas públicas. Precios se exponen mediante vista/RPC invocable solo por miembros.
- Cliente: lee/actualiza su perfil y ficha permitida; opera su carrito y lee sus pedidos.
- Subadmin: lee clientes y administra pedidos e inventario de su organización.
- Admin: CRUD del tenant en entidades administrativas y membresías, nunca otro tenant.
- Historiales, movimientos y auditoría: insertados por funciones controladas; no se
  permiten `UPDATE`/`DELETE` directos.
- Service role: solo servidor, webhooks y tareas internas; jamás en variables `NEXT_PUBLIC_*`.

## 7. Requisitos no funcionales

- **Seguridad:** validación compartida con Zod, CSP y cabeceras, rate limiting en Auth,
  checkout/PDF, sanitización de archivos, secretos en gestores de entorno y revisión RLS.
- **Performance:** imágenes Next optimizadas, paginación cursor, consultas selectivas,
  caché con etiquetas e invalidación, lazy loading y presupuesto móvil de Core Web Vitals.
- **Calidad:** lint, typecheck, tests unitarios, integración contra Supabase local y E2E
  de catálogo/login/checkout/admin crítico en CI.
- **Accesibilidad:** WCAG 2.2 AA, navegación por teclado, foco visible, contraste y
  componentes Shadcn/Radix correctamente etiquetados.
- **Producción:** migraciones reproducibles, backups/PITR según plan Supabase, previews
  aisladas, checklist de despliegue y procedimiento de rollback.

## 8. Tema y experiencia mobile first

Tokens de marca: azul `#0057B8`, naranja `#FF6B00`, blanco `#FFFFFF` y gris
`#F3F4F6`. El selector de tema ofrece claro, oscuro y automático. El modo automático
por horario usa la zona del navegador (claro 07:00-19:00) y debe evitar parpadeo al
hidratar. Catálogo con controles táctiles de al menos 44 px, filtros en drawer móvil,
carrito persistente y tablas administrativas adaptadas a tarjetas en pantallas pequeñas.

## 9. Dependencias y variables previstas

Dependencias principales: Next.js 15, React, TypeScript, Tailwind, Shadcn/Radix,
`@supabase/supabase-js`, `@supabase/ssr`, Zod, React Hook Form, utilidades de clases,
generador PDF/QR seleccionado mediante spike, Vitest, Testing Library y Playwright.

Variables mínimas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # solo servidor cuando sea imprescindible
NEXT_PUBLIC_SITE_URL
```

## 10. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fuga de precios o datos entre tenants | Crítico | RLS deny-by-default, vistas separadas, pruebas con usuarios cruzados y revisión de políticas. |
| Sobreventa por concurrencia | Alto | Reservas y checkout transaccional con bloqueo de filas; libro de movimientos. |
| Precio cambia durante checkout | Alto | Resolver precio en servidor y guardar snapshot; nunca confiar en total del cliente. |
| Árbol de categorías cíclico | Medio | Trigger y pruebas de integridad. |
| PDF pesado o timeout serverless | Alto | Spike temprano, compresión/caché y generación asíncrona si supera límites de Vercel. |
| WhatsApp no confirma entrega | Medio | Pedido se persiste antes de abrir `wa.me`; registrar intención, no asumir envío. |
| Requisitos fiscales/logísticos incompletos | Alto | Mantener importes e impuestos extensibles; validar reglas argentinas antes de producción. |
| Datos personales y analítica | Alto | Minimización, retención, consentimiento y política de privacidad antes de tracking. |
| Next.js 15 frente a versiones nuevas | Medio | Fijar versiones compatibles y actualizar deliberadamente tras pruebas. |
| Configuración remota de Supabase/Vercel pendiente | Medio | Desarrollo local reproducible y checklist de secretos/entornos. |
| Registrante auto-activado como cliente (sin aprobación) | Alto | Decisión MVP (ADR-020); incorporar flujo de aprobación pendiente→activo en el backoffice (Sprint 5). |
| Confirmación de email desactivada en local | Medio | Solo entorno local para validar el flujo; producción debe reactivar `enable_confirmations`. |
| Reservas de stock no se liberan al cancelar | Medio | Completar la máquina de estados y la liberación de reservas en Sprint 4. |
| `NEXT_PUBLIC_SUPABASE_URL` remota mal formada (`/rest/v1/`) | Alto | Corregir a la URL base del proyecto; rompe catálogo y login en Vercel. |
| Migraciones/seed del Supabase remoto sin confirmar | Alto | `supabase db push` y carga de datos reales antes de mergear/desplegar. |
| Deployment Protection impide validar el preview | Medio | Ajustar protección o usar bypass para revalidar el flujo en Vercel. |

## 11. Estado de implementación

| Área | Estado | Evidencia / siguiente paso |
|---|---|---|
| Requisitos y arquitectura | Completado | Este documento, roadmap y registro de decisiones. |
| Proyecto Next.js | Completado | Next.js 15.5.19, TypeScript estricto, Tailwind, Shadcn, pruebas y CI configurados. |
| Supabase local y migraciones | Completado | Supabase local validado con `db:reset`, `db:lint` y `db:types` exitosos. |
| Autenticación y RLS | Completado (MVP) | Login/registro/logout con Supabase Auth; alta de cliente vía RPC `register_customer`; RLS y guardas de servidor activas. Aprobación comercial de clientes y recuperación de contraseña pendientes. |
| Catálogo / carrito / pedidos | Sprint 3 completado | Precios privados, carrito local, checkout transaccional (`place_order`) y WhatsApp implementados. Historial/detalle de pedidos del cliente pendiente. |
| Administración / CRM / PDF | Pendiente | Sprints 5-7. |
| Producción | Pendiente | Sprint 8. |

## 12. Próximo Sprint Recomendado

**Sprint 4 - Pedidos del cliente y robustez (no iniciado).**

Alcance recomendado:

- Implementar máquina de estados del pedido con transiciones válidas y liberación de
  reservas de stock al cancelar.
- Crear historial y detalle de pedidos del cliente (`/pedidos`).
- Añadir recuperación de contraseña y reenvío de confirmación de email.
- Incorporar idempotencia y rate limiting en checkout y endpoints sensibles.
- Sumar smoke E2E del flujo login → carrito → checkout → WhatsApp.

**Salida esperada:** el cliente gestiona y consulta sus pedidos, y el flujo comercial es
robusto frente a concurrencia y reintentos.

## 13. Registro de estado (append-only)

### 2026-06-20 - Inicio

- Brief leído y requisitos funcionales/técnicos analizados.
- Arquitectura, estructura objetivo, modelo, esquema Supabase, autenticación, roles,
  permisos, riesgos, dependencias y orden de implementación documentados.
- Próximo hito: ejecutar Sprint 0 e iniciar el esquema seguro del Sprint 1.

### 2026-06-20 - Primera implementación del Sprint 0

- Repositorio Git inicializado y dependencias bloqueadas en `package-lock.json`.
- Next.js 15.5.19 configurado con App Router, rutas tipadas, TypeScript estricto,
  Tailwind CSS, estructura Shadcn y tokens de marca claro/oscuro.
- Shell mobile first, home, catálogo vacío, acceso pendiente, loading, 404 y límite de
  error implementados. No se agregaron mocks de productos.
- Selector de tema claro/oscuro/automático implementado; automático usa horario local
  07:00-19:00 y evita parpadeo previo a hidratación.
- Variables públicas validadas con Zod y `.env.example` creado sin secretos.
- Vulnerabilidad transitiva de PostCSS incluida en Next 15 mitigada mediante override a
  8.5.15; `npm install` reporta cero vulnerabilidades.
- Verificación exitosa: `npm run lint`, `npm run typecheck` y `npm run build`.
- Próximo hito real: pruebas/CI para cerrar Sprint 0 y migración base de Supabase.

### 2026-06-20 - Cierre del Sprint 0

- Estado real del código contrastado con brief, arquitectura, roadmap y decisiones; no
  se detectaron desvíos funcionales ni se iniciaron recursos o migraciones Supabase.
- Vitest 4 con `jsdom`, React Testing Library y matchers de `jest-dom` configurados para
  pruebas de componentes Next.js/React en TypeScript.
- Cuatro pruebas automatizadas agregadas: render de Home, Catálogo y Acceso, más
  validación semántica de destinos de navegación principales.
- GitHub Actions configurado en `.github/workflows/ci.yml` para `push` y pull requests a
  `main`, usando Node.js 22, `npm ci`, permisos de solo lectura, timeout y cancelación de
  ejecuciones obsoletas.
- Cadena local verificada en el orden de CI: `npm run lint`, `npm run typecheck`,
  `npm run test` (4/4) y `npm run build`, todos exitosos.
- Sprint 0 cerrado. Sprint 1 queda pendiente y no iniciado; la primera ejecución remota
  del workflow ocurrirá cuando el repositorio se publique en GitHub.

### 2026-06-20 - Implementación y cierre del Sprint 1

- Supabase CLI 2.107.0 fijado como dependencia de desarrollo y `config.toml` reconocido
  por la CLI. Scripts de inicio, reset, lint y generación de tipos agregados.
- Primera migración creada con 18 tablas: las 11 mínimas más organizaciones,
  membresías, inventario, movimientos e historiales de precios y estados.
- Tenancy mediante `organization_id`, roles por membresía, enums, constraints,
  relaciones compuestas, índices y auditoría `created_at`/`updated_at` implementados.
- Triggers agregados para perfil de nuevos usuarios, timestamps, jerarquía de categorías,
  historial de precios, movimientos de inventario e historial de estados.
- RLS habilitado en todas las tablas de aplicación. Catálogo activo y proyección segura
  de stock son públicos; precios requieren membresía autenticada; clientes solo leen
  pedidos propios; subadmin y admin quedan restringidos al tenant.
- Buckets `product-images` y `organization-assets` configurados con tamaño/MIME y
  políticas de escritura por admin y carpeta de organización.
- Seed idempotente creado con organización, tres marcas, cinco categorías, cinco
  productos, inventario, lista general y precios en las cuatro presentaciones.
- Clientes Supabase browser/server y middleware de refresco de sesión configurados con
  `@supabase/ssr`; variables se validan al crear el cliente y ninguna service role se
  expone al navegador.
- Generación de tipos preparada mediante `npm run db:types`; no se mantiene un tipo
  manual que pueda divergir del esquema.
- Ocho pruebas pasan: cuatro de UI y cuatro contratos de entorno/RLS/precios. También
  pasan lint, TypeScript estricto y build de producción.
- Limitación del entorno: Docker Desktop no está instalado, por lo que no pudieron
  ejecutarse `db reset`, `db lint` ni la generación efectiva de tipos. Este gate debe
  resolverse antes de iniciar Sprint 2 y no invalida la existencia/configuración pedida.
- Sprint 1 cerrado conforme a los criterios explícitos. Sprint 2 no fue iniciado.

### 2026-06-20 - Revalidación del gate Supabase local

- Toolchain confirmado: Node.js 24.16.0, npm 11.13.0 y Supabase CLI 2.107.0.
- WSL 2 está disponible (versión 2.6.2) y configurado como versión predeterminada.
- Docker Desktop no está instalado: no existe el ejecutable estándar, `docker` no está
  en `PATH`, no hay proceso/servicio y el daemon `//./pipe/docker_engine` no responde.
- `winget` tampoco está disponible; se documentó instalación mediante el instalador
  oficial de Docker Desktop para Windows en `supabase/README.md`.
- Por restricción explícita no se ejecutaron ni se marcaron como completos `db reset`,
  `db lint` o `db:types`; `db:start` tampoco puede funcionar sin daemon.
- La aplicación permanece estable: lint, typecheck, 8/8 pruebas y build pasan.
- Gate Supabase local bloqueado y Sprint 2 deshabilitado hasta ejecutar, sin omisiones:
  `db:start`, `db:reset`, `db:lint` y `db:types` con Docker operativo.

### 2026-06-20 - Cierre formal de Sprint 1 y resolución del gate

- Sprint 1 cerrado formalmente el 2026-06-20.
- Supabase local validado exitosamente: `db:reset`, `db:lint` y `db:types` finalizaron OK.
- Cadena de calidad completa validada: lint, typecheck, test y build finalizaron OK.
- El gate técnico de Docker/Supabase quedó resuelto y deja de bloquear el roadmap.
- Sprint 2 quedó habilitado, sin iniciar ninguna de sus tareas.

### 2026-06-20 - Inicio de Sprint 2: catálogo público funcional

- Sprint 2 iniciado formalmente con el catálogo público como primer incremento.
- `/catalogo` consume exclusivamente datos reales de Supabase mediante
  `public_catalog_products`; no se incorporaron mocks ni fuentes alternativas.
- Listado limitado por RLS a productos, marcas y categorías activas, con imagen principal,
  nombre, marca, categoría, descripción, stock seguro, promoción y destacado.
- Búsqueda por nombre y filtro por categoría implementados en servidor mediante parámetros
  de URL; grid mobile first de una, dos y cuatro columnas.
- Estados loading, vacío y error implementados para la ruta de catálogo.
- `/catalogo/[slug]` muestra el detalle público completo disponible, sin consultar ni
  renderizar precios, y ofrece acceso a login para verlos.
- La vista pública sigue excluyendo importes y stock reservado; las políticas RLS no se
  modificaron ni relajaron.
- Validación final exitosa: lint, typecheck, 10/10 pruebas y build de producción.

### 2026-06-20 - Cierre de Sprint 2

- Sprint 2 cerrado formalmente como catálogo B2B público navegable y mobile first.
- Paginación server-side de 12 productos implementada con conteo exacto, URLs persistentes
  y redirección de páginas fuera de rango.
- Categorías padre y subcategorías incorporadas con filtrado combinado; la resolución de
  descendientes ocurre en servidor y valida la relación jerárquica.
- Metadata específica para Home y Catálogo, metadata dinámica por producto, Open Graph
  básico y datos estructurados `Product` sin precios implementados.
- Detalle ampliado con breadcrumbs, ficha comercial, stock, unidad, promociones,
  destacado y CTA visible de login, sin consultar ni mostrar importes.
- Cobertura automatizada ampliada a 15 pruebas para respuesta controlada de Supabase,
  búsqueda, filtros, jerarquía, detalle, metadata y ocultamiento de precios.
- Playwright evaluado y diferido: requiere navegador, web server y Supabase reproducible
  en CI; no se agregó complejidad operativa para duplicar la cobertura actual.
- Gate de cierre exitoso: lint, typecheck, 15/15 pruebas y build de producción.
- No se inició carrito, pedidos, CRM ni administración. Sprint 3 permanece no iniciado.

### 2026-06-20 - Implementación y cierre de Sprint 3 (carrito + pedidos + WhatsApp)

- Revisión previa completa: brief, estado, roadmap y decisiones contrastados con el código.
  Se detectó que toda la implementación de Sprint 2 estaba sin commitear y que la
  autenticación de Sprint 1 no existía; ambos puntos se informaron antes de comenzar.
- Baseline de Sprint 2 commiteada en la rama `feat/sprint-3-cart-orders` antes de iniciar.
- Autenticación email/contraseña con Server Actions (login, registro, logout). Alta de
  cliente mediante RPC `register_customer` (`security definer`, idempotente, auto-activa en
  el MVP). Confirmación de email desactivada solo en local (ADR-020).
- Precios resueltos en servidor desde `product_prices` y mostrados únicamente a miembros
  activos; visitantes no reciben importes (verificado en runtime: el detalle público no
  filtra precios).
- Carrito con persistencia local (`localStorage`), presentaciones, cantidades mínimas, badge
  en header, página `/carrito` y subtotal estimado (ADR-021).
- Checkout `/checkout` con validación Zod y RPC transaccional `place_order`: resuelve precios,
  valida mínimos y stock con bloqueo de fila, reserva inventario con movimiento, genera número
  y snapshots, y devuelve total. Enlace `wa.me` construido en servidor tras persistir (ADR-022).
- Migración aditiva `202606200002_cart_orders.sql` (no se modificó la inicial) y seed con un
  cliente de prueba pre-confirmado para validación de extremo a extremo.
- Flujo `place_order` validado a nivel SQL como cliente autenticado: pedido, snapshots y
  reserva correctos; mínimos, stock e idempotencia de `register_customer` verificados.
- Suite ampliada a 27 pruebas (carrito, precios por sesión, WhatsApp, checkout, dinero).
- Gate de cierre exitoso, sin omisiones: `db:reset`, `db:lint`, `db:types`, lint, typecheck,
  27/27 pruebas y build de producción.
- Riesgos abiertos: aprobación comercial de clientes diferida, confirmación de email local
  desactivada y reservas de stock sin liberación automática (ver sección 10).

### 2026-06-20 - Validación del preview de Vercel (PR #1) - BLOQUEADA

- Objetivo: confirmar que el preview de Vercel use variables correctas y datos reales antes
  de mergear `feat/sprint-3-cart-orders`.
- Variables en Vercel (`logi-market`, Preview + Production): `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` presentes. La anon key está marcada *Sensitive* (no legible
  por CLI), y **no existe `SUPABASE_SERVICE_ROLE_KEY`**: no hay claves de servicio expuestas
  al cliente. Falta `NEXT_PUBLIC_SITE_URL` (usa el default `localhost:3000`).
- **Bloqueante 1 (configuración):** `NEXT_PUBLIC_SUPABASE_URL` está como
  `https://deizsoojahyjfowyeuda.supabase.co/rest/v1/`. `@supabase/ssr` agrega las rutas
  `/rest/v1`, `/auth/v1`, etc., por lo que el sufijo produce endpoints inválidos
  (`/rest/v1//rest/v1`, `/rest/v1//auth/v1`) y rompe catálogo y login. Debe ser la URL base
  del proyecto, sin path.
- **Bloqueante 2 (acceso):** el deployment de preview responde 401 (Deployment Protection de
  Vercel), por lo que no se pudo abrir la app ni validar el flujo (home, catálogo, login,
  carrito, checkout) de forma anónima.
- **Migraciones remotas: NO CONFIRMADAS.** El proyecto Supabase remoto existe y responde
  (PostgREST devuelve 401 por falta de apikey), pero no se pudo verificar el esquema ni el
  seed porque la anon key no es legible y no hay credenciales de base de datos disponibles.
- **Decisión: NO mergear.** Por la regla "si faltan migraciones o seed en Supabase remoto, no
  mergear" y al no poder confirmarlas, el merge queda bloqueado hasta resolver los puntos
  anteriores. El flujo end-to-end sí está validado contra Supabase local.
- Remediación propuesta: (1) corregir `NEXT_PUBLIC_SUPABASE_URL` a la URL base sin `/rest/v1/`;
  (2) definir `NEXT_PUBLIC_SITE_URL`; (3) `supabase link` + `supabase db push` al proyecto
  remoto y cargar datos reales (sin el usuario de prueba del seed en producción); (4) ajustar
  Deployment Protection o usar un bypass para revalidar el flujo en el preview.

### 2026-06-21 - Remediación Etapa 1 (Vercel) aplicada; Etapa 2 (DB) congelada

- Hallazgo de seguridad confirmado: el proyecto Supabase `deizsoojahyjfowyeuda` y las variables
  `NEXT_PUBLIC_*` son **compartidos por Preview y Production**. Por lo tanto `supabase db push`
  afectaría producción. Se escaló y, por decisión del usuario, **Etapa 2 (DB) queda congelada**
  y la validación funcional del flujo la realiza el usuario manualmente.
- **Etapa 1 (solo Vercel, sin tocar Production):**
  - `NEXT_PUBLIC_SUPABASE_URL` corregida y **scopeada al preview de la rama**
    `feat/sprint-3-cart-orders` → `https://deizsoojahyjfowyeuda.supabase.co` (sin `/rest/v1/`).
  - `NEXT_PUBLIC_SITE_URL` definida para el mismo preview de rama → alias estable del preview.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` se mantiene (Sensitive, no legible). **No** se configuró
    `SUPABASE_SERVICE_ROLE_KEY` en ningún entorno.
  - Nota de transparencia: al reconfigurar, `vercel env rm ... preview` eliminó la variable de
    URL en ambos entornos; se **restauró Production de inmediato a su valor original**
    (`.../rest/v1/`), dejándolo sin cambios respecto al estado previo.
- Pendiente para validación funcional completa en preview: aplicar migraciones/seed al Supabase
  remoto (Etapa 2, congelada) y resolver el acceso (Deployment Protection 401). Hasta entonces el
  preview corregido alcanza Supabase, pero el catálogo/login no tendrán datos.
