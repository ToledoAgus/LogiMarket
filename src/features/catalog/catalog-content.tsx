import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FilterX, LockKeyhole, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProductCard } from "./product-card";
import type { CatalogCategory, CatalogPagination, CatalogProduct } from "./types";

type CatalogContentProps = {
  categories: CatalogCategory[];
  pagination: CatalogPagination;
  parentCategoryId?: string;
  products: CatalogProduct[];
  search?: string;
  subcategoryId?: string;
};

function catalogHref({
  page,
  parentCategoryId,
  search,
  subcategoryId,
}: Pick<CatalogContentProps, "parentCategoryId" | "search" | "subcategoryId"> & { page: number }) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (parentCategoryId) params.set("category", parentCategoryId);
  if (subcategoryId) params.set("subcategory", subcategoryId);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return (query ? `/catalogo?${query}` : "/catalogo") as Route;
}

function visiblePages(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CatalogContent({
  categories,
  pagination,
  parentCategoryId = "",
  products,
  search = "",
  subcategoryId = "",
}: CatalogContentProps) {
  const hasFilters = Boolean(search || parentCategoryId || subcategoryId);
  const parentCategories = categories.filter((category) => category.parentId === null);
  const subcategories = categories.filter(
    (category) => category.parentId === parentCategoryId,
  );

  return (
    <div className="container py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link className="hover:text-primary" href="/">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-foreground">Catálogo</li>
        </ol>
      </nav>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Productos</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Catálogo mayorista</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Explorá productos y disponibilidad actual. Iniciá sesión para consultar precios.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/login">
            <LockKeyhole aria-hidden="true" className="size-4" /> Iniciar sesión para ver precios
          </Link>
        </Button>
      </div>

      <form className="mt-8 grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,16rem)_minmax(10rem,16rem)_auto]" method="get">
        <label className="relative">
          <span className="sr-only">Buscar por nombre</span>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="min-h-11 w-full rounded-md border bg-background py-2 pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-primary"
            defaultValue={search}
            name="q"
            placeholder="Buscar por nombre"
            type="search"
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por categoría</span>
          <select
            className="min-h-11 w-full rounded-md border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-primary"
            defaultValue={parentCategoryId}
            name="category"
          >
            <option value="">Todas las categorías</option>
            {parentCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrar por subcategoría</span>
          <select
            className="min-h-11 w-full rounded-md border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            defaultValue={subcategoryId}
            disabled={!parentCategoryId || subcategories.length === 0}
            name="subcategory"
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <Button type="submit">Aplicar filtros</Button>
      </form>

      {products.length > 0 ? (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {pagination.totalCount} {pagination.totalCount === 1 ? "producto" : "productos"}
            </p>
            {hasFilters ? (
              <Link className="text-sm font-bold text-primary hover:underline" href="/catalogo">Limpiar filtros</Link>
            ) : null}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {pagination.totalPages > 1 ? (
            <nav aria-label="Paginación del catálogo" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <Button asChild={pagination.page > 1} disabled={pagination.page === 1} size="icon" variant="outline">
                {pagination.page > 1 ? (
                  <Link aria-label="Página anterior" href={catalogHref({ page: pagination.page - 1, parentCategoryId, search, subcategoryId })}>
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </Link>
                ) : <span aria-label="Página anterior"><ChevronLeft aria-hidden="true" className="size-5" /></span>}
              </Button>
              {visiblePages(pagination.page, pagination.totalPages).map((page) => (
                <Button asChild={page !== pagination.page} key={page} size="icon" variant={page === pagination.page ? "default" : "outline"}>
                  {page === pagination.page ? (
                    <span aria-current="page" aria-label={`Página ${page}`}>{page}</span>
                  ) : (
                    <Link aria-label={`Página ${page}`} href={catalogHref({ page, parentCategoryId, search, subcategoryId })}>{page}</Link>
                  )}
                </Button>
              ))}
              <Button asChild={pagination.page < pagination.totalPages} disabled={pagination.page >= pagination.totalPages} size="icon" variant="outline">
                {pagination.page < pagination.totalPages ? (
                  <Link aria-label="Página siguiente" href={catalogHref({ page: pagination.page + 1, parentCategoryId, search, subcategoryId })}>
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </Link>
                ) : <span aria-label="Página siguiente"><ChevronRight aria-hidden="true" className="size-5" /></span>}
              </Button>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed bg-card p-8 text-center sm:p-14">
          <FilterX aria-hidden="true" className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold">No encontramos productos</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {hasFilters
              ? "Probá con otro nombre o seleccioná una categoría diferente."
              : "Todavía no hay productos activos disponibles en el catálogo."}
          </p>
          {hasFilters ? <Button asChild className="mt-6" variant="outline"><Link href="/catalogo">Limpiar filtros</Link></Button> : null}
        </div>
      )}
    </div>
  );
}
