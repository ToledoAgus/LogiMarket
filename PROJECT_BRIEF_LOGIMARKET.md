# LOGIMARKET

## Descripción General

LogiMarket es una plataforma web B2B para comercialización de productos alimenticios de consumo masivo.

El sistema debe permitir:

* Mostrar catálogo digital de productos.
* Gestionar clientes.
* Gestionar pedidos.
* Administrar precios.
* Administrar stock.
* Gestionar promociones.
* Generar pedidos online.
* Integrar pedidos por WhatsApp.
* Descargar catálogo PDF.
* Escalar posteriormente a CRM comercial completo.

---

# Objetivo del MVP

Desarrollar una primera versión completamente funcional para:

* Ejecutar localmente.
* Utilizar Supabase desde el inicio.
* Desplegar posteriormente en Vercel.

La aplicación debe ser escalable y preparada para crecimiento futuro.

---

# Público Objetivo

Inicialmente:

* Kioscos
* Almacenes
* Autoservicios

Futuro:

* Consumidor final (B2C)

---

# Nombre Comercial

LogiMarket

---

# Stack Tecnológico Obligatorio

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Row Level Security (RLS)

## Deploy

* GitHub
* Vercel

---

# Diseño

Inspiración:

* Arcor
* Bagley
* Catálogos mayoristas modernos

## Paleta

Azul principal

```css
#0057B8
```

Naranja promociones

```css
#FF6B00
```

Blanco

```css
#FFFFFF
```

Gris tarjetas

```css
#F3F4F6
```

---

# Responsive

La aplicación debe funcionar correctamente en:

* Android
* iPhone
* Tablet
* Notebook
* Desktop

Diseño Mobile First obligatorio.

---

# Modo Oscuro

Implementar:

* Modo claro
* Modo oscuro
* Cambio automático según horario
* Selector manual

---

# Catálogo Público

Sin login.

Los usuarios pueden:

* Ver productos
* Ver categorías
* Ver imágenes
* Ver promociones
* Buscar productos

Los usuarios NO pueden:

* Ver precios
* Comprar

---

# Registro e Inicio de Sesión

Cuando el usuario intenta:

* Ver precios
* Agregar productos al carrito
* Realizar pedidos

Debe registrarse o iniciar sesión.

Utilizar Supabase Auth.

---

# Roles

## Visitante

Puede:

* Navegar catálogo

No puede:

* Ver precios
* Comprar

---

## Cliente

Puede:

* Ver precios
* Comprar
* Consultar historial

---

## Subadministrador

Puede:

* Gestionar pedidos
* Gestionar clientes
* Actualizar stock

---

## Administrador

Control total.

---

# Productos Iniciales

Crear inicialmente:

1. Surtido Bagley
2. Surtido Diversión
3. Traviata x3
4. Chocolina 250 g
5. Alfajor Genérico

El sistema debe permitir agregar productos ilimitados.

---

# Gestión de Productos

CRUD completo.

Campos:

* Nombre
* Marca
* Descripción
* Imagen principal
* Galería de imágenes
* Código interno
* Categoría
* Subcategoría
* Stock
* Producto destacado
* Promoción activa
* Compra mínima requerida
* Cantidad mínima

---

# Gestión de Categorías

CRUD completo.

Debe soportar:

* Categorías
* Subcategorías
* Jerarquía ilimitada

Ejemplo:

Galletitas

* Dulces
* Saladas
* Rellenas

Alfajores

* Dulce de leche
* Chocolate

---

# Gestión de Marcas

CRUD completo.

Ejemplos:

* Bagley
* Arcor
* Terrabusi
* Oreo

---

# Gestión de Precios

Cada producto puede tener:

* Precio Unitario
* Precio Caja
* Precio Display
* Precio Bulto

Debe existir historial de cambios.

---

# Gestión de Stock

Estados configurables:

* Disponible
* Bajo Stock
* Sin Stock

Mostrar stock disponible.

---

# Promociones

Permitir:

* Descuentos
* Combos
* Productos destacados

Etiquetas:

* Oferta
* Nuevo
* Más vendido
* Promoción

---

# Carrito de Compras

Permitir:

* Agregar productos
* Modificar cantidades
* Eliminar productos
* Agregar observaciones

Mostrar:

* Subtotal
* Total estimado

---

# Pedidos

Campos:

* Número de pedido
* Fecha
* Cliente
* Estado
* Total

Estados:

* Pendiente
* Confirmado
* Preparación
* Despachado
* Entregado
* Cancelado

---

# Checkout

Solicitar:

* Nombre
* Apellido
* Comercio
* Teléfono
* Email
* Dirección
* Observaciones

---

# Integración WhatsApp

Número:

1151461419

Generar automáticamente un mensaje con:

* Número de pedido
* Cliente
* Productos
* Cantidades
* Totales
* Observaciones

Botón:

Enviar pedido por WhatsApp

---

# CRM Comercial

Crear módulo de clientes.

Campos:

* Comercio
* Titular
* Teléfono
* Email
* Dirección
* Zona
* Estado

Indicadores:

* Historial de pedidos
* Ticket promedio
* Frecuencia de compra
* Última compra

---

# Dashboard Administrativo

Mostrar:

* Ventas
* Pedidos
* Clientes activos
* Productos vendidos
* Productos más vendidos
* Productos más vistos
* Stock crítico

Gráficos:

* Ventas por período
* Pedidos por período
* Categorías más vendidas

---

# Catálogo PDF

Implementar botón:

Descargar Catálogo PDF

El PDF debe generarse automáticamente utilizando los productos vigentes.

Debe incluir:

* Portada
* Logo LogiMarket
* Productos
* Imágenes
* Marca
* Descripción
* Categoría
* Unidad de venta
* Stock

Si el usuario está autenticado:

* Mostrar precios

Si el usuario NO está autenticado:

* Ocultar precios

Agregar:

* Información comercial
* WhatsApp
* QR para pedidos

Disponible desde:

* Home
* Catálogo
* Panel administrador

El administrador puede regenerar el PDF.

---

# Base de Datos Inicial

Crear las tablas necesarias.

Mínimo:

* profiles
* customers
* brands
* categories
* products
* product_images
* product_prices
* price_lists
* orders
* order_items
* promotions

Agregar cualquier tabla adicional necesaria para una arquitectura profesional.

---

# Seguridad

Implementar:

* Supabase Auth
* Roles
* RLS
* Protección de rutas
* Validaciones
* Manejo de errores

---

# Estructura Esperada

Antes de programar:

1. Definir arquitectura.
2. Diseñar modelo entidad-relación.
3. Diseñar esquema SQL.
4. Diseñar políticas RLS.
5. Definir estructura de carpetas.
6. Generar roadmap de sprints.

Luego:

7. Crear proyecto.
8. Configurar Supabase.
9. Configurar autenticación.
10. Crear frontend.
11. Crear panel administrativo.
12. Implementar PDF.
13. Preparar deploy para Vercel.

---

# Criterio de Calidad

No generar código de ejemplo.

No generar mocks innecesarios.

Construir una base sólida y escalable.

Priorizar:

* Arquitectura limpia.
* Componentes reutilizables.
* Seguridad.
* Performance.
* Escalabilidad.
* Experiencia móvil.
* Preparación para producción.

El objetivo es que LogiMarket pueda evolucionar posteriormente hacia una plataforma SaaS comercial multiempresa.
