# LogiMarket - Registro de decisiones

> Registro append-only. No editar ni borrar decisiones aceptadas; si una decisión
> cambia, agregar una nueva entrada que la reemplace y enlazar ambas.

## Plantilla

```text
### ADR-NNN - Título
Fecha | Estado | Reemplaza
Contexto
Decisión
Consecuencias
```

### ADR-001 - Monolito modular con Next.js App Router

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El MVP necesita catálogo, cuenta, compra y administración con un equipo y
dominio aún en formación. Separar servicios aumentaría despliegues y contratos sin una
necesidad de escala demostrada.

**Decisión:** Usar Next.js 15 App Router como monolito modular organizado por features,
con Server Components para lectura y Server Actions/Route Handlers para mutaciones. La
base Supabase actúa como límite de persistencia y autorización.

**Consecuencias:** Menor complejidad operativa y tipado de extremo a extremo. Los
módulos deben conservar límites claros para extraer procesos cuando exista evidencia.

### ADR-002 - Multiempresa desde el esquema inicial

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El objetivo futuro es SaaS multiempresa. Agregar tenant después afectaría
todas las claves, políticas e índices.

**Decisión:** Crear `organizations` y asociar las entidades de negocio mediante
`organization_id`; los roles viven en `organization_members`. El MVP tendrá una sola
organización configurada.

**Consecuencias:** Las consultas y pruebas son algo más explícitas desde el inicio, pero
se evita una migración riesgosa y RLS puede garantizar aislamiento real.

### ADR-003 - Autorización en membresías y RLS deny-by-default

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** La interfaz o el middleware no son fronteras de seguridad y la metadata
editable por el usuario no es apropiada para roles.

**Decisión:** Resolver roles desde `organization_members`; habilitar RLS en toda tabla
expuesta y crear políticas explícitas de mínimo privilegio. El middleware refresca
sesión, mientras servidor y RLS autorizan cada operación. La service role queda solo en
servidor para tareas justificadas.

**Consecuencias:** Se requieren helpers SQL y pruebas de acceso negativas. Un error en
la UI no permite saltar permisos, y los tenants quedan aislados en base de datos.

### ADR-004 - Separar catálogo público de precios privados

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Visitantes pueden ver productos y disponibilidad, pero nunca precios. Un
`SELECT *` o caché compartida podría filtrar datos.

**Decisión:** Mantener precios en tablas protegidas y exponer catálogo mediante
consultas/vistas sin columnas de precio. Los precios aplicables se resuelven por RPC o
consulta autenticada con RLS. Las variantes PDF usan cachés y claves separadas.

**Consecuencias:** Catálogo público puede cachearse agresivamente; la composición de
producto y precio es explícita y debe probarse contra fugas.

### ADR-005 - Dinero en centavos y snapshots de pedido

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Los flotantes introducen errores y los pedidos deben conservar su valor
aunque cambien productos o precios.

**Decisión:** Guardar importes como `bigint` en unidades menores con moneda ISO 4217.
Al confirmar, el servidor recalcula y copia SKU, nombre, presentación, cantidad y
precios a `order_items` dentro de una transacción.

**Consecuencias:** Los cálculos son deterministas y auditables; toda frontera debe usar
helpers de dinero y no asumir siempre dos decimales.

### ADR-006 - Inventario mediante libro de movimientos

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Editar un número de stock directamente impide auditar diferencias y hace
frágil la concurrencia durante pedidos.

**Decisión:** Mantener balance operativo en `inventory` y registrar toda variación en
`inventory_movements`. Checkout/reservas se realizan con función transaccional y bloqueo
de filas; los ajustes administrativos requieren motivo.

**Consecuencias:** Hay trazabilidad y menor riesgo de sobreventa, a cambio de funciones
y tests de concurrencia adicionales.

### ADR-007 - Categorías con adjacency list protegida contra ciclos

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Se exige jerarquía ilimitada y PostgreSQL soporta recorridos recursivos.

**Decisión:** Usar `categories.parent_id` autorreferente, índices por tenant/padre y un
trigger que rechace ciclos y padres de otra organización.

**Consecuencias:** CRUD simple y profundidad ilimitada; las consultas profundas usarán
CTE recursivo y se vigilará su costo.

### ADR-008 - PDF dinámico con spike antes de fijar librería

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El PDF depende de imágenes, fuentes, QR, volumen y límites serverless; una
elección prematura puede causar timeouts o artefactos grandes.

**Decisión:** Definir un contrato de generación dinámico y ejecutar un spike con datos
reales antes de seleccionar librería. Si el tiempo excede el límite de Vercel, mover la
generación a tarea asíncrona y almacenar versiones por audiencia.

**Consecuencias:** La librería queda deliberadamente abierta hasta Sprint 7; seguridad
de caché y separación público/privado son requisitos del contrato.

### ADR-009 - Tema automático basado en horario local con opción manual

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El brief exige claro, oscuro, cambio automático por horario y selector.

**Decisión:** Ofrecer `light`, `dark` y `auto`; en automático usar zona del navegador,
claro de 07:00 a 18:59 y oscuro el resto. Persistir solo la preferencia y aplicar un
script previo a hidratación para evitar parpadeo.

**Consecuencias:** Cumple el horario sin geolocalización; debe probarse SSR/hidratación
y documentar los límites horarios en preferencias.

### ADR-010 - Override transitorio de PostCSS dentro de Next.js 15

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** La versión estable instalada de Next.js 15.5.19 incluye PostCSS 8.4.31,
afectado por GHSA-qx2v-qp2m-jg93. `npm audit` reportó dos hallazgos moderados vinculados
a esa única dependencia transitiva. El brief exige permanecer en Next.js 15.

**Decisión:** Fijar PostCSS 8.5.15 como dependencia directa y mediante `overrides` de
npm, verificando que Next resuelva la misma versión. Revisar y retirar el override al
actualizar Next cuando su árbol ya incluya una versión corregida.

**Consecuencias:** La auditoría queda en cero y se mantiene Next.js 15. El override debe
probarse en cada actualización porque reemplaza una dependencia interna del framework.

### ADR-011 - Vitest y Testing Library para pruebas de componentes

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Sprint 0 requiere comprobar el render de Server Components síncronos y la
navegación inicial sin incorporar todavía infraestructura E2E ni Supabase. Las pruebas
deben ser rápidas, tipadas y ejecutables de igual forma localmente y en CI.

**Decisión:** Usar Vitest con entorno `jsdom`, React Testing Library y `jest-dom` para
pruebas de componentes. Validar contratos visibles mediante roles accesibles, contenido
esencial y destinos `href`, evitando snapshots de estructura o clases CSS. Ejecutar en
GitHub Actions sobre Node.js 22 con `npm ci`, seguido de lint, tipos, tests y build.

**Consecuencias:** La suite inicial ofrece feedback rápido y estable con bajo costo de
mantenimiento. No sustituye pruebas E2E de navegación real ni integración con Supabase;
esas capas se incorporarán en los sprints donde exista comportamiento que las requiera.

### ADR-012 - Catálogo público mediante proyección sin precios

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El catálogo debe mostrar disponibilidad a visitantes, pero inventario
contiene reservas y precios son información comercial privada. RLS controla filas, no
columnas, por lo que exponer tablas completas ampliaría innecesariamente la superficie.

**Decisión:** Mantener inventario y precios en tablas independientes protegidas. Exponer
`public_catalog_products` como proyección explícita con producto, marca, categoría,
cantidad disponible y estado, excluyendo reservas e importes. Las tablas de precios no
tienen política `anon` y exigen una membresía activa para lectura autenticada.

**Consecuencias:** El catálogo público puede consultar stock seguro sin unir tablas
privadas desde el cliente. Toda columna nueva de la vista requiere revisión de seguridad
y las políticas deben probarse en PostgreSQL local antes de Sprint 2.

### ADR-013 - Sesión Supabase SSR con configuración fail-closed

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Next.js App Router necesita compartir la sesión entre navegador, Server
Components y middleware. Construir clientes con variables ausentes puede producir
fallos tardíos o conexiones incorrectas; la service role no debe entrar al bundle web.

**Decisión:** Usar `@supabase/ssr` para clientes browser/server y refrescar la sesión en
middleware mediante `auth.getUser()`. Validar URL y anon key con Zod al crear cada
cliente. Mantener service role fuera de estos helpers y documentarla solo como variable
server opcional para trabajos futuros justificados.

**Consecuencias:** Las rutas que usan Supabase fallan de forma explícita cuando falta
configuración y las cookies permanecen sincronizadas. El middleware añade una llamada
de validación de sesión por request dinámico; exclusiones evitan assets estáticos.

### ADR-014 - Tipos generados únicamente desde PostgreSQL aplicado

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** El entorno actual no dispone de Docker y no puede aplicar la migración
localmente. Mantener tipos escritos a mano contradice la fuente única de verdad y puede
ocultar diferencias entre SQL y TypeScript.

**Decisión:** Fijar Supabase CLI y preparar `npm run db:types`, pero generar
`database.generated.ts` solo desde una base local reseteada. La ejecución de reset,
lint y generación es gate obligatorio antes de comenzar Sprint 2.

**Consecuencias:** No hay falsa seguridad de tipos durante esta iteración. La integración
SSR funciona sin genéricos por ahora; las consultas de catálogo deberán esperar a que
el gate produzca tipos coherentes con PostgreSQL.

### ADR-015 - No sustituir el gate local con una base remota

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** N/A

**Contexto:** Docker Desktop no está instalado y el stack Supabase local no puede
iniciarse. Una base remota o tipos manuales permitirían continuar, pero introducirían
claves, estado compartido y una validación distinta de la migración reproducible.

**Decisión:** Mantener Sprint 2 deshabilitado. Instalar/abrir Docker Desktop y ejecutar
localmente, sin omisiones y en orden, `db:start`, `db:reset`, `db:lint` y `db:types`.
No usar un proyecto remoto ni escribir tipos manuales para sortear el bloqueo.

**Consecuencias:** El avance funcional se detiene hasta disponer del daemon, pero el
esquema, seed, RLS y tipos se validarán contra una instancia limpia y reproducible sin
exponer claves reales ni contaminar entornos compartidos.

### ADR-016 - Cierre del gate técnico de Supabase local

**Fecha:** 2026-06-20  
**Estado:** Aceptada  
**Reemplaza:** ADR-015 en cuanto al estado temporal de bloqueo

**Contexto:** El gate posterior a Sprint 1 exigía validar la migración y el seed contra
Supabase local, ejecutar el lint de base de datos y generar los tipos TypeScript desde
PostgreSQL antes de habilitar el siguiente sprint.

**Decisión:** Dar por resuelto el gate Docker/Supabase tras completar exitosamente
`db:reset`, `db:lint` y `db:types`. Registrar además la validación satisfactoria de
lint, typecheck, test y build, y cerrar formalmente Sprint 1 el 2026-06-20.

**Consecuencias:** Supabase local queda validado de extremo a extremo y ya no bloquea el
roadmap. Sprint 2 queda habilitado, aunque no se inicia ninguna de sus tareas mediante
esta decisión.

### ADR-017 - Catálogo público consultado desde la proyección segura

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** Sprint 2 necesita listar y detallar productos reales para visitantes con
búsqueda, categoría, imágenes, promociones y stock, sin exponer importes ni cantidades
reservadas y sin duplicar las reglas de actividad en la interfaz.

**Decisión:** Consultar productos desde `public_catalog_products` usando el cliente SSR
con anon key y enriquecerlos únicamente con `product_images`, `promotion_products` y
`promotions`, todas bajo sus políticas públicas vigentes. Ejecutar búsqueda por nombre y
filtro por categoría en Supabase. No consultar `product_prices` desde rutas públicas.

**Consecuencias:** Listado y detalle comparten un contrato tipado, los productos inactivos
y datos sensibles permanecen fuera de la respuesta, y RLS sigue siendo la frontera de
autorización. Los precios solo se incorporarán en un flujo autenticado posterior.

### ADR-018 - Paginación y filtros jerárquicos dirigidos por URL

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** El catálogo B2B debe navegar volúmenes crecientes, combinar búsqueda con
categorías padre y subcategorías, conservar estado al compartir una URL y seguir siendo
renderizable en servidor para accesibilidad y SEO.

**Decisión:** Paginar `public_catalog_products` en servidor en bloques de 12 usando
`range` y conteo exacto. Representar búsqueda, categoría, subcategoría y página en query
params. Resolver descendientes de categoría en servidor y rechazar combinaciones
jerárquicas inconsistentes antes de construir el filtro Supabase.

**Consecuencias:** Las URLs son reproducibles y los clientes no descargan el catálogo
completo. Cambiar el tamaño de página altera la distribución de URLs paginadas, y una
página fuera de rango se canoniza mediante redirección a la última disponible.

### ADR-019 - Diferir Playwright hasta disponer de un entorno E2E reproducible

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** El flujo mínimo de catálogo puede cubrirse con Playwright, pero el proyecto
todavía no incluye la dependencia, navegadores, web server de prueba ni arranque de
Supabase local dentro de CI. Incorporarlo ahora duplicaría cobertura sin validar un
entorno equivalente al real.

**Decisión:** Cerrar Sprint 2 con pruebas Vitest/Testing Library sobre respuestas
controladas en el límite Supabase y contratos RLS. Incorporar Playwright cuando CI pueda
levantar aplicación, navegador y Supabase de manera reproducible.

**Consecuencias:** Búsqueda, filtros, detalle, metadata y ocultamiento de precios quedan
cubiertos en 15 pruebas rápidas, pero la navegación real entre páginas conserva riesgo
residual hasta sumar el smoke E2E. Este diferimiento no habilita mocks en runtime.

### ADR-020 - Autenticación email/contraseña con alta de cliente vía RPC

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** Sprint 3 (precios, carrito y pedidos) requiere sesión real, pero las
pantallas de Auth quedaron diferidas en Sprint 1. Un nuevo registrante obtiene `profiles`
por trigger, pero no puede crear su `customers` ni `organization_members` porque la RLS de
esas tablas exige rol admin. Crear esas filas desde el cliente violaría el mínimo
privilegio (ADR-003).

**Decisión:** Implementar login, registro y logout con Supabase Auth (email + contraseña)
mediante Server Actions. El alta comercial se realiza con la función
`register_customer` (`security definer`, `search_path` vacío), acotada a `auth.uid()` en la
única organización del MVP, idempotente, que crea la ficha de cliente y la membresía como
`active`. En desarrollo local se desactiva `enable_confirmations` para validar el flujo de
extremo a extremo; producción debe reactivar la confirmación por email.

**Consecuencias:** El flujo funciona sin panel administrativo, pero todo registrante queda
auto-activado como cliente y puede ver precios. El paso de aprobación comercial real
(pendiente → activo) se posterga al backoffice (Sprint 5) y queda registrado como riesgo.

### ADR-021 - Carrito con persistencia local y servidor como autoridad de importes

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** El brief y el alcance de Sprint 3 piden persistencia local del carrito. El
modelo previó tablas `carts`/`cart_items`, pero un carrito server-side agrega RLS,
sincronización y migración antes de tener evidencia de que se necesite multidispositivo.

**Decisión:** Mantener el carrito en `localStorage` mediante un contexto cliente
(`CartProvider`), versionado por clave (`logimarket-cart-v1`) y tolerante a almacenamiento
no disponible. Los importes guardados son solo de referencia para el subtotal estimado; el
checkout recalcula precios y total en el servidor desde `product_prices` vigentes (ADR-005).
No se crean tablas `carts`/`cart_items` en este sprint.

**Consecuencias:** Menor superficie y cero estado compartido entre dispositivos. Si más
adelante se requiere carrito sincronizado se incorporarán las tablas previstas sin afectar
la frontera de precios, que ya vive en el servidor.

### ADR-022 - Checkout transaccional vía `place_order` y WhatsApp post-persistencia

**Fecha:** 2026-06-20
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** Crear un pedido implica resolver precios, validar mínimos y stock, reservar
inventario, generar número y escribir snapshots, todo de forma atómica y sin confiar en
importes del cliente. WhatsApp no confirma entrega, por lo que el pedido debe existir antes
de generar el enlace.

**Decisión:** Implementar `place_order` (`security definer`, `search_path` vacío) que, para
el cliente activo de `auth.uid()`, resuelve la lista de precios vigente, valida cantidad
mínima y disponibilidad con bloqueo de fila (`for update`), reserva stock con movimiento de
inventario `reservation`, inserta `orders` + `order_items` con snapshots y devuelve número y
total. El enlace `wa.me` se construye en servidor con los importes ya persistidos y el
número de la organización.

**Consecuencias:** El total es determinista y auditable, y la sobreventa queda mitigada por
el bloqueo. Las reservas no se liberan automáticamente al cancelar un pedido; esa máquina de
estados y la confirmación administrativa se completarán en Sprint 4/5.

### ADR-023 - Proyecto Supabase dedicado para validar el preview (no tocar el compartido)

**Fecha:** 2026-06-21
**Estado:** Aceptada
**Reemplaza:** N/A

**Contexto:** El proyecto Supabase `deizsoojahyjfowyeuda` y las variables `NEXT_PUBLIC_*` en
Vercel están compartidos por los entornos Preview y Production. Aplicarle migraciones con
`supabase db push` para validar el PR afectaría la base que sirve a producción, lo que viola
la restricción de no impactar producción.

**Decisión:** No ejecutar `db push` ni cargar seed contra `deizsoojahyjfowyeuda`. Crear/usar un
proyecto Supabase **dedicado al preview** de la rama `feat/sprint-3-cart-orders`, apuntar allí
las variables de Preview scopeadas a la rama (URL + anon, sin `service_role`), aplicar
migraciones y un seed comercial mínimo, y validar el flujo contra ese proyecto. Production y su
Supabase quedan intactos.

**Consecuencias:** La validación del preview no arriesga producción y queda reproducible. Se
introduce una dependencia operativa (un proyecto Supabase extra para preview) y la necesidad de
credenciales del nuevo proyecto antes de ejecutar. El merge del PR queda condicionado a esta
validación. La corrección de la URL en Production (que conserva el sufijo `/rest/v1/`) queda
pendiente como tarea separada, fuera del alcance de esta decisión.
