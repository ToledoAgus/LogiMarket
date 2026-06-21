import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Star } from "lucide-react";

import { ProductImage } from "./product-image";
import type { CatalogProduct } from "./types";

const stockLabels = {
  available: "Disponible",
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
} as const;

export function ProductCard({ product }: { product: CatalogProduct }) {
  const productHref = `/catalogo/${product.slug}` as Route;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      <Link aria-label={`Ver ${product.name}`} href={productHref}>
        <ProductImage image={product.image} name={product.name} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {product.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              <Star aria-hidden="true" className="size-3" /> Destacado
            </span>
          ) : null}
          {product.promotions.map((promotion) => (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground" key={promotion.id}>
              {promotion.label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
          {product.brandName ?? "Sin marca"}
        </p>
        <h2 className="mt-1 text-xl font-black leading-tight">
          <Link className="hover:text-primary" href={productHref}>
            {product.name}
          </Link>
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {product.categoryName ?? "Sin categoría"}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {product.description ?? "Sin descripción disponible."}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-sm font-bold">{stockLabels[product.stockStatus]}</p>
            <p className="text-xs text-muted-foreground">
              {product.availableQuantity} {product.salesUnit}
            </p>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary" href={productHref}>
            Ver detalle <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
