# LogiMarket - Roadmap

> Documento vivo y acumulativo. Marcar tareas sin eliminar entradas previas. Las fechas
> son de actualización; la duración se expresa en sprints de dos semanas y se ajustará
> con la velocidad real del equipo.

**Última actualización:** 2026-06-20  
**Sprint activo:** Sprint 3 cerrado (carrito + pedidos + WhatsApp); Sprint 4 parcialmente cubierto

## Criterios de prioridad

1. Seguridad y aislamiento de datos.
2. Camino vertical catálogo -> autenticación -> precio -> carrito -> pedido.
3. Operación administrativa necesaria para sostener ese camino.
4. CRM, analítica y PDF sobre datos reales.
5. Optimización y endurecimiento para producción.

## Definición de terminado global

Una tarea se considera completada cuando el código está tipado, validado, probado en
el nivel correspondiente, es usable en móvil, respeta RLS, incluye estados de carga,
vacío y error, y deja actualizados `PROJECT_STATE.md`, `ROADMAP.md` y, si aplica,
`DECISION_LOG.md`.

## Sprint 0 - Fundaciones y experiencia base

**Objetivo:** repositorio reproducible, arquitectura ejecutable y estándares de calidad.

- [x] Leer y analizar íntegramente el brief.
- [x] Diseñar arquitectura, modelo de datos, roles, permisos y estrategia RLS.
- [x] Documentar riesgos, dependencias y orden de implementación.
- [x] Inicializar Git y Next.js 15 con App Router, TypeScript, Tailwind y `src/`.
- [x] Configurar lint, formato, TypeScript estricto y aliases.
- [x] Instalar/configurar Shadcn UI y tokens de marca.
- [x] Crear shell mobile first, metadatos, selector claro/oscuro/automático y páginas base.
- [x] Añadir `.env.example`, validación de entorno y manejo común de errores.
- [x] Configurar pruebas unitarias y CI inicial (lint, typecheck, test, build).

**Salida:** aplicación base ejecutable localmente, sin secretos ni mocks de negocio.

## Sprint 1 - Supabase, esquema, Auth y seguridad (Completado: 2026-06-20)

**Objetivo:** persistencia multiempresa y acceso seguro validados localmente.

- [x] Inicializar Supabase local y migraciones versionadas.
- [x] Crear tipos SQL, tablas, constraints, índices, triggers y funciones del núcleo.
- [x] Crear seed idempotente con organización y cinco productos iniciales.
- [x] Implementar políticas RLS y Storage deny-by-default.
- [x] Generar tipos TypeScript desde PostgreSQL.
- [x] Integrar clientes Supabase browser/server y refresco SSR de sesión.
- [ ] Implementar registro, confirmación, login, logout y recuperación.
- [ ] Crear guardas por rol y pruebas negativas de acceso cruzado/anon/precios.

**Cierre del Sprint 1:** completado y validado localmente el 2026-06-20. El gate
Docker/Supabase quedó resuelto con reset, lint y generación de tipos exitosos. Las
tareas funcionales de Auth que permanecen abiertas continúan en el backlog del MVP,
pero ya no bloquean el inicio futuro de Sprint 2.

**Salida:** un usuario puede autenticarse y solo acceder a datos permitidos de su tenant.

## Sprint 2 - Catálogo público (Completado: 2026-06-20)

**Objetivo:** catálogo real, rápido y accesible sin exponer precios.

- [x] Implementar home, listado, detalle, búsqueda, filtros y paginación.
- [x] Implementar categorías jerárquicas, marcas, imágenes y promociones públicas.
- [x] Mostrar disponibilidad sin filtrar datos sensibles de inventario.
- [x] Optimizar imágenes, metadata, Open Graph básico y datos estructurados de producto.
- [x] Añadir estados de carga/error/vacío y pruebas automatizadas de UI y contratos.

**Diferido deliberadamente:** sitemap completo y Playwright E2E se incorporarán cuando
exista un entorno CI de Supabase reproducible; no bloquean el catálogo B2B navegable.

**Salida:** visitante navega el catálogo completo; precio y compra disparan autenticación.

**Avance del primer incremento:**

- [x] Conectar listado y detalle con datos reales de Supabase, sin mocks.
- [x] Mostrar productos activos, imagen principal, marca, categoría, descripción y stock.
- [x] Mostrar badges de promoción y destacado.
- [x] Implementar grid mobile first de 1/2/4 columnas.
- [x] Implementar búsqueda por nombre y filtro por categoría.
- [x] Implementar estados loading, vacío y error.
- [x] Crear `/catalogo/[slug]` con detalle y CTA de inicio de sesión.
- [x] Mantener precios fuera de la consulta pública y conservar RLS vigente.

## Sprint 3 - Carrito, pedidos y WhatsApp (Completado: 2026-06-20)

**Objetivo:** transformar el catálogo navegable en transaccional de extremo a extremo.

El alcance ejecutado combinó el Sprint 3 original (precios privados y carrito) con el flujo
de checkout/pedidos/WhatsApp del Sprint 4, más la base de Auth diferida de Sprint 1.

- [x] Implementar autenticación email/contraseña: login, registro y logout (Server Actions).
- [x] Resolver lista y precio vigente en servidor por presentación.
- [x] Mostrar precios solo a miembros activos; visitantes nunca reciben importes.
- [x] Implementar carrito con persistencia local, cantidades mínimas y presentaciones.
- [x] Calcular subtotales y total estimado; el total final se recalcula en servidor.
- [x] Implementar checkout con datos de contacto/dirección y validación Zod.
- [x] Crear pedido, items snapshot y reserva de stock en transacción (`place_order`).
- [x] Generar número de pedido e historial de estado inicial.
- [x] Generar mensaje WhatsApp al número de la organización tras persistir el pedido.
- [x] Validar mínimos, stock y aislamiento de precios (pruebas SQL y de componentes).

**Diferido a sprints posteriores:** liberación de reservas al cancelar, máquina de estados
completa, historial/detalle de pedidos del cliente, idempotencia/rate limiting y E2E.

**Salida:** un cliente autenticado arma un carrito válido, confirma un pedido persistido con
importes verificables y lo comparte por WhatsApp.

## Sprint 4 - Pedidos del cliente y robustez (pendiente)

**Objetivo:** completar la operación del pedido más allá del primer flujo feliz.

- [x] Checkout con validación Zod y creación transaccional de pedido (adelantado en Sprint 3).
- [x] Generar mensaje WhatsApp después de persistir el pedido (adelantado en Sprint 3).
- [ ] Máquina de estados de pedido con transiciones válidas y liberación de reservas.
- [ ] Crear historial y detalle de pedidos del cliente.
- [ ] Añadir idempotencia, rate limiting y pruebas de concurrencia/E2E.

**Salida:** pedido real persistido, auditable, gestionable y compartible por WhatsApp.

## Sprint 5 - Backoffice operativo

**Objetivo:** administrar catálogo y operación sin acceso directo a base de datos.

- [ ] Shell administrativo y navegación adaptativa por permisos.
- [ ] CRUD de productos, imágenes, categorías y marcas.
- [ ] Gestión de listas/precios con historial inmutable.
- [ ] Gestión de inventario mediante movimientos y alertas de stock crítico.
- [ ] Gestión de promociones, combos, destacados y etiquetas.
- [ ] Gestión de pedidos y transiciones válidas de estado.
- [ ] Auditoría, validación de archivos y pruebas de permisos subadmin/admin.

**Salida:** admin mantiene el negocio; subadmin solo pedidos, clientes y stock.

## Sprint 6 - CRM y dashboard

**Objetivo:** dar visibilidad comercial accionable sobre información real.

- [ ] CRUD y ficha de clientes con estado, zona y datos de contacto.
- [ ] Calcular historial, ticket promedio, frecuencia y última compra.
- [ ] Implementar KPIs y gráficos por período con zona horaria definida.
- [ ] Incorporar productos vendidos, más vendidos, más vistos y stock crítico.
- [ ] Definir retención/privacidad de eventos de vistas y optimizar consultas.

**Salida:** equipo comercial consulta cartera y métricas consistentes.

## Sprint 7 - Catálogo PDF

**Objetivo:** catálogo descargable coherente con sesión y datos vigentes.

- [ ] Ejecutar spike de librería, peso, fuentes, imágenes y límites de Vercel.
- [ ] Diseñar portada, grilla, información comercial, WhatsApp y QR.
- [ ] Generar variante pública sin precios y privada con precios aplicables.
- [ ] Añadir acceso desde home, catálogo y admin; regeneración y caché segura.
- [ ] Probar autorización, paginación visual, volumen y accesibilidad del enlace.

**Salida:** PDF vigente sin posibilidad de filtrar precios entre variantes.

## Sprint 8 - Producción y lanzamiento

**Objetivo:** lanzamiento observable, reversible y protegido.

- [ ] Auditoría de RLS, secretos, dependencias, cabeceras, CSP y rate limits.
- [ ] Pruebas E2E completas, accesibilidad WCAG 2.2 AA y performance móvil.
- [ ] Configurar Supabase remoto, migraciones, backups y Storage.
- [ ] Configurar GitHub, CI protegida y Vercel preview/staging/production.
- [ ] Añadir observabilidad, alertas, runbooks y procedimiento de rollback.
- [ ] Ejecutar carga inicial, smoke test y checklist de aceptación.

**Salida:** MVP desplegado con monitoreo y operación documentada.

## Después del MVP

- [ ] Facturación, impuestos y documentos comerciales según normativa validada.
- [ ] Notificaciones transaccionales y automatización comercial.
- [ ] Importaciones/exportaciones masivas e integración con ERP/logística.
- [ ] Portal B2C aislado por canal y política de precios.
- [ ] Autoservicio multiempresa, planes, límites, onboarding y facturación SaaS.

## Dependencias de secuencia

```text
Sprint 0 -> Sprint 1 -> Sprint 2 -> Sprint 3 -> Sprint 4
                                \-> Sprint 5 -> Sprint 6
                                             \-> Sprint 7 -> Sprint 8
```

El PDF se posterga hasta estabilizar catálogo/precios; el dashboard hasta disponer de
pedidos reales; el panel se construye después de probar RLS y flujo de cliente.

## Historial de roadmap (append-only)

### 2026-06-20

- Roadmap inicial creado en nueve sprints, priorizando el flujo comercial vertical y
  las restricciones de seguridad antes de ampliar la superficie administrativa.
- Sprint 0 iniciado; análisis y documentación completados.
- Base Next.js implementada y verificada con lint, typecheck y build de producción.
- Pendiente para cerrar Sprint 0: pruebas automatizadas y workflow de CI.

### 2026-06-20 - Cierre de Sprint 0

- Vitest, React Testing Library y `jsdom` configurados con cuatro pruebas de render y
  navegación para las páginas públicas iniciales.
- Workflow de GitHub Actions agregado con instalación reproducible y cadena completa de
  lint, tipos, pruebas y build sobre Node.js 22.
- Validación local completa exitosa; Sprint 0 cerrado.
- Sprint 1 permanece sin iniciar por restricción explícita de esta iteración.

### 2026-06-20 - Cierre de Sprint 1

- Configuración Supabase, migración inicial de 18 tablas, seed idempotente, RLS, Storage
  y clientes SSR/browser implementados.
- Contratos automatizados comprueban RLS en todas las tablas y que la proyección pública
  no contiene importes; 8/8 pruebas, lint, tipos y build pasan.
- Supabase CLI reconoce el proyecto, pero Docker Desktop no está disponible para aplicar
  la migración, ejecutar `db lint` o generar los tipos desde PostgreSQL.
- Sprint 1 cerrado según criterios explícitos. Antes de Sprint 2 sigue vigente el gate:
  ejecutar reset/lint/tipos y completar flujos Auth y pruebas RLS con usuarios reales.

### 2026-06-20 - Gate Supabase local bloqueado

- [x] Verificar Node.js, npm, Supabase CLI, WSL y disponibilidad de Docker Desktop.
- [ ] Instalar y abrir Docker Desktop hasta que `docker version` muestre cliente y servidor.
- [ ] Ejecutar `npm run db:start`.
- [ ] Ejecutar `npm run db:reset` y verificar migración más seed.
- [ ] Ejecutar `npm run db:lint` sin errores.
- [ ] Ejecutar `npm run db:types` y versionar los tipos generados.
- [x] Revalidar aplicación: lint, tipos, 8/8 pruebas y build exitosos.

Docker Desktop y `docker` están ausentes; WSL 2 está preparado y `winget` no existe.
Las instrucciones exactas quedaron en `supabase/README.md`. Sprint 2 no puede comenzar
hasta completar todos los ítems pendientes de este gate.

### 2026-06-20 - Gate Supabase local resuelto y Sprint 2 habilitado

- [x] Ejecutar `npm run db:reset` y verificar migración más seed.
- [x] Ejecutar `npm run db:lint` sin errores.
- [x] Ejecutar `npm run db:types` y generar los tipos desde PostgreSQL local.
- [x] Revalidar lint, typecheck, test y build.
- Sprint 1 quedó completado y cerrado el 2026-06-20.
- El gate Docker/Supabase quedó resuelto; Sprint 2 está habilitado, pero ninguna de sus
  tareas fue iniciada.

### 2026-06-20 - Inicio de Sprint 2

- Sprint 2 iniciado con el catálogo público conectado a `public_catalog_products`.
- Listado, detalle por slug, búsqueda, categoría, imágenes, promociones, destacado,
  disponibilidad segura y estados de interfaz implementados.
- Visitantes no reciben consultas ni contenido de precios; el CTA dirige a `/login`.
- Permanecen abiertos los ítems amplios del sprint: paginación, navegación jerárquica,
  SEO completo, Open Graph, sitemap, datos estructurados y cobertura responsive/E2E.
- Gate del incremento exitoso: lint, typecheck, 10/10 pruebas y build de producción.

### 2026-06-20 - Cierre de Sprint 2

- Paginación server-side, filtros jerárquicos padre/subcategoría y breadcrumbs completos.
- SEO preparado con metadata Home/Catálogo, metadata dinámica por producto, Open Graph
  básico y JSON-LD `Product` sin ofertas ni precios.
- Detalle comercial ampliado con imagen principal, stock, unidad, promoción, destacado y
  CTA de autenticación para precios.
- Suite ampliada a 15 pruebas; Playwright evaluado y diferido por costo de infraestructura
  hasta disponer de Supabase y navegador reproducibles en CI.
- Lint, typecheck, 15/15 pruebas y build exitosos.
- Sprint 2 cerrado. Sprint 3 no iniciado; carrito, pedidos, CRM y admin permanecen fuera.

### 2026-06-20 - Cierre de Sprint 3 (carrito + pedidos + WhatsApp)

- Baseline de Sprint 2 commiteada antes de iniciar (estaba sin commit en el working tree).
- Auth email/contraseña: login, registro y logout con Server Actions; alta de cliente
  idempotente vía RPC `register_customer` (ADR-020). Confirmación de email desactivada solo
  en local para validar el flujo completo; producción debe reactivarla.
- Precios resueltos en servidor y mostrados solo a miembros activos; el detalle de producto
  ofrece carrito a clientes y CTA de login a visitantes, sin filtrar importes (verificado en
  runtime y por pruebas).
- Carrito con persistencia local (`localStorage`), presentaciones, cantidades mínimas,
  badge en el header y página `/carrito` (ADR-021).
- Checkout `/checkout` con validación Zod y RPC transaccional `place_order`: resuelve precios,
  valida mínimos y stock con bloqueo de fila, reserva inventario, genera número y snapshots
  (ADR-022). Mensaje WhatsApp construido en servidor tras persistir el pedido.
- Migración aditiva `202606200002_cart_orders.sql` (no se tocó la inicial) y seed con cliente
  de prueba pre-confirmado para validación local.
- Suite ampliada a 27 pruebas (carrito, precios por sesión, WhatsApp, checkout). Validado el
  flujo `place_order` a nivel SQL como cliente autenticado.
- Gate completo exitoso: `db:reset`, `db:lint`, `db:types`, lint, typecheck, 27/27 y build.

### 2026-06-20 - Validación del preview de Vercel (PR #1): bloqueada, sin merge

- Variables en Vercel correctas en presencia (URL + anon, Preview + Production); anon marcada
  *Sensitive* y sin `service_role` expuesta. Falta `NEXT_PUBLIC_SITE_URL`.
- Bloqueante: `NEXT_PUBLIC_SUPABASE_URL` termina en `/rest/v1/` y rompe los endpoints de
  Supabase (catálogo y login). El preview además está protegido (401) y no se pudo validar el
  flujo de forma anónima. Las migraciones/seed del Supabase remoto no pudieron confirmarse.
- Decisión: **no mergear** hasta corregir la URL, confirmar migraciones/seed remotas y
  revalidar el flujo. El flujo end-to-end permanece validado contra Supabase local.
