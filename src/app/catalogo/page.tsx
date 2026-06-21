import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CatalogContent } from "@/features/catalog/catalog-content";
import { getCatalog } from "@/features/catalog/queries";

export const metadata: Metadata = {
  description: "Explorá productos mayoristas por categoría, marca y promoción, con disponibilidad actualizada.",
  openGraph: {
    description: "Productos mayoristas con disponibilidad actualizada, sin precios públicos.",
    title: "Catálogo mayorista",
    type: "website",
  },
  title: "Catálogo",
};

type CatalogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: string | undefined) {
  return value && uuidPattern.test(value) ? value : "";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstValue(resolvedSearchParams.q)?.trim() ?? "";
  const parentCategoryId = validUuid(firstValue(resolvedSearchParams.category));
  const subcategoryId = validUuid(firstValue(resolvedSearchParams.subcategory));
  const pageCandidate = Number.parseInt(firstValue(resolvedSearchParams.page) ?? "1", 10);
  const page = Number.isSafeInteger(pageCandidate) && pageCandidate > 0 ? pageCandidate : 1;
  const { categories, pagination, products } = await getCatalog({
    page,
    parentCategoryId,
    search,
    subcategoryId,
  });

  if (page > pagination.totalPages) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (parentCategoryId) params.set("category", parentCategoryId);
    if (subcategoryId) params.set("subcategory", subcategoryId);
    if (pagination.totalPages > 1) params.set("page", String(pagination.totalPages));
    redirect(params.size ? `/catalogo?${params.toString()}` : "/catalogo");
  }

  return (
    <CatalogContent
      categories={categories}
      pagination={pagination}
      parentCategoryId={parentCategoryId}
      products={products}
      search={search}
      subcategoryId={subcategoryId}
    />
  );
}
