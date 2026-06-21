import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CatalogPage from "@/app/catalogo/page";
import ProductDetailPage, { generateMetadata } from "@/app/catalogo/[slug]/page";
import { collectCategoryIds, getCatalog, getCatalogProduct } from "@/features/catalog/queries";
import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";

vi.mock("@/features/catalog/queries", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/catalog/queries")>();
  return {
    ...original,
    getCatalog: vi.fn(),
    getCatalogProduct: vi.fn(),
  };
});

const parentId = "00000000-0000-4000-8000-000000000201";
const childId = "00000000-0000-4000-8000-000000000203";

const categories: CatalogCategory[] = [
  { id: parentId, name: "Galletitas", parentId: null, slug: "galletitas" },
  { id: childId, name: "Dulces", parentId, slug: "dulces" },
];

const product: CatalogProduct = {
  availableQuantity: 9,
  brandName: "Bagley",
  categoryId: childId,
  categoryName: "Dulces",
  description: "Galletitas de chocolate en presentación de 250 g.",
  id: "00000000-0000-4000-8000-000000000304",
  image: null,
  internalCode: "GAL-CHO-250",
  isFeatured: true,
  minimumQuantity: 1,
  name: "Chocolina 250 g",
  promotions: [{ id: "promotion-1", label: "Oferta" }],
  requiresMinimumPurchase: false,
  salesUnit: "paquete",
  slug: "chocolina-250-g",
  stockStatus: "low_stock",
};

beforeEach(() => {
  vi.mocked(getCatalog).mockReset();
  vi.mocked(getCatalogProduct).mockReset();
});

describe("catálogo conectado a la capa Supabase", () => {
  it("renderiza la respuesta controlada de Supabase", async () => {
    vi.mocked(getCatalog).mockResolvedValue({
      categories,
      pagination: { page: 1, pageSize: 12, totalCount: 1, totalPages: 1 },
      products: [product],
    });

    render(await CatalogPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: product.name })).toBeInTheDocument();
    expect(screen.getByText("Stock bajo")).toBeInTheDocument();
    expect(screen.getByText("Oferta")).toBeInTheDocument();
  });

  it("combina búsqueda, categoría, subcategoría y página en la consulta", async () => {
    vi.mocked(getCatalog).mockResolvedValue({
      categories,
      pagination: { page: 2, pageSize: 12, totalCount: 13, totalPages: 2 },
      products: [product],
    });

    await CatalogPage({
      searchParams: Promise.resolve({
        category: parentId,
        page: "2",
        q: "Chocolina",
        subcategory: childId,
      }),
    });

    expect(getCatalog).toHaveBeenCalledWith({
      page: 2,
      parentCategoryId: parentId,
      search: "Chocolina",
      subcategoryId: childId,
    });
  });

  it("resuelve descendientes para el filtro jerárquico", () => {
    const grandchildId = "00000000-0000-4000-8000-000000000204";
    expect(
      collectCategoryIds(
        [...categories, { id: grandchildId, name: "Chocolate", parentId: childId, slug: "chocolate" }],
        parentId,
      ),
    ).toEqual([parentId, childId, grandchildId]);
  });
});

describe("detalle público de producto", () => {
  it("muestra ficha, breadcrumbs y CTA sin importes para visitantes", async () => {
    vi.mocked(getCatalogProduct).mockResolvedValue(product);

    render(await ProductDetailPage({ params: Promise.resolve({ slug: product.slug }) }));

    const breadcrumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumbs).getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(within(breadcrumbs).getByRole("link", { name: "Catálogo" })).toHaveAttribute("href", "/catalogo");
    expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ficha comercial" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar sesión para ver precios/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/\$\s*\d|ARS\s*\d/i)).not.toBeInTheDocument();
  });

  it("genera metadata dinámica con nombre y descripción del producto", async () => {
    vi.mocked(getCatalogProduct).mockResolvedValue(product);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: product.slug }) });

    expect(metadata.title).toBe(product.name);
    expect(metadata.description).toBe(product.description);
    expect(metadata.openGraph).toMatchObject({ title: product.name });
  });
});
