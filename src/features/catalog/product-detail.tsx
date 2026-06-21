import Link from "next/link";
import { LockKeyhole, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProductImage } from "./product-image";
import type { CatalogProduct } from "./types";

const stockLabels = {
  available: "Disponible",
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
} as const;

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    category: product.categoryName ?? undefined,
    description: product.description ?? undefined,
    image: product.image?.url,
    name: product.name,
    sku: product.internalCode,
  };

  return (
    <div className="container py-8 sm:py-12">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-primary" href="/">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="hover:text-primary" href="/catalogo">Catálogo</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-foreground">{product.name}</li>
        </ol>
      </nav>

      <article className="grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-2">
        <div className="md:min-h-[34rem]">
          <ProductImage
            image={product.image}
            name={product.name}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap gap-2">
            {product.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                <Star aria-hidden="true" className="size-3" /> Destacado
              </span>
            ) : null}
            {product.promotions.map((promotion) => (
              <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground" key={promotion.id}>
                {promotion.label}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-widest text-primary">
            {product.brandName ?? "Sin marca"}
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{product.name}</h1>
          <p className="mt-2 font-medium text-muted-foreground">
            {product.categoryName ?? "Sin categoría"}
          </p>
          <p className="mt-6 leading-7 text-muted-foreground">
            {product.description ?? "Sin descripción disponible."}
          </p>

          <section aria-labelledby="commercial-sheet" className="mt-7">
            <h2 className="text-lg font-bold" id="commercial-sheet">Ficha comercial</h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 rounded-xl border bg-background p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Código</dt><dd className="mt-1 font-bold">{product.internalCode}</dd></div>
              <div><dt className="text-muted-foreground">Unidad de venta</dt><dd className="mt-1 font-bold">{product.salesUnit}</dd></div>
              <div><dt className="text-muted-foreground">Stock</dt><dd className="mt-1 font-bold">{stockLabels[product.stockStatus]} ({product.availableQuantity})</dd></div>
              <div><dt className="text-muted-foreground">Compra mínima</dt><dd className="mt-1 font-bold">{product.requiresMinimumPurchase ? `${product.minimumQuantity} unidades` : "Sin mínimo"}</dd></div>
            </dl>
          </section>

          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="font-bold">Precio exclusivo para clientes</p>
            <p className="mt-1 text-sm text-muted-foreground">Iniciá sesión para consultar precios y condiciones comerciales.</p>
            <Button asChild className="mt-4 w-full sm:w-auto" size="lg">
              <Link href="/login"><LockKeyhole aria-hidden="true" className="size-4" /> Iniciar sesión para ver precios</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
