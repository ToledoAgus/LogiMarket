import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getApplicablePrices } from "@/features/catalog/prices";
import { ProductDetail } from "@/features/catalog/product-detail";
import { getCatalogProduct } from "@/features/catalog/queries";
import { isActiveMember } from "@/lib/auth/session";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) return { title: "Producto no encontrado" };

  const description = product.description
    ?? `${product.name} de ${product.brandName ?? "LogiMarket"}. Consultá disponibilidad en nuestro catálogo mayorista.`;

  return {
    description,
    openGraph: {
      description,
      images: product.image ? [{ alt: product.image.alt, url: product.image.url }] : undefined,
      title: product.name,
      type: "website",
    },
    title: product.name,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) notFound();

  const member = await isActiveMember();
  const prices = member ? (await getApplicablePrices([product.id])).get(product.id) ?? [] : [];

  return <ProductDetail prices={prices} product={product} />;
}
