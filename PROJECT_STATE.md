# LogiMarket - Estado del proyecto

> Documento vivo. Actualizar en cada cambio relevante sin borrar el historial de la
> sección "Registro de estado".

**Última actualización:** 2026-06-20  
**Fase:** Sprint 1 cerrado; Sprint 2 habilitado y no iniciado  
**Estado general:** Gate Docker/Supabase resuelto; validación local completa  
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

## 11. Estado de implementación

| Área | Estado | Evidencia / siguiente paso |
|---|---|---|
| Requisitos y arquitectura | Completado | Este documento, roadmap y registro de decisiones. |
| Proyecto Next.js | Completado | Next.js 15.5.19, TypeScript estricto, Tailwind, Shadcn, pruebas y CI configurados. |
| Supabase local y migraciones | Completado | Supabase local validado con `db:reset`, `db:lint` y `db:types` exitosos. |
| Autenticación y RLS | Base completada | Clientes SSR/browser, middleware, perfiles, roles y RLS implementados; pantallas Auth completas permanecen en el backlog del MVP. |
| Catálogo / carrito / pedidos | Pendiente | Sprints 2-4. |
| Administración / CRM / PDF | Pendiente | Sprints 5-7. |
| Producción | Pendiente | Sprint 8. |

## 12. Próximo Sprint Recomendado

**Sprint 2 - Catálogo público (habilitado, no iniciado).**

Alcance exacto:

- Implementar home, listado, detalle, búsqueda, filtros y paginación.
- Implementar categorías jerárquicas, marcas, imágenes y promociones públicas.
- Mostrar disponibilidad sin exponer datos sensibles de inventario ni precios.
- Optimizar imágenes, SEO, Open Graph, sitemap y datos estructurados.
- Añadir estados de carga, error y vacío, más pruebas responsive y E2E.

**Salida esperada:** el visitante navega el catálogo completo; las acciones de precio y
compra requieren autenticación. Esta sección solo recomienda y habilita el alcance; no
registra el inicio de tareas de Sprint 2.

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
