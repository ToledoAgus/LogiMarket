import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";
import { SiteHeader } from "@/components/layout/site-header";
import { CatalogContent } from "@/features/catalog/catalog-content";
import { CartProvider } from "@/features/cart/cart-provider";
import type { CatalogProduct } from "@/features/catalog/types";

vi.mock("@/lib/auth/session", () => ({
  getActiveCustomer: vi.fn(async () => null),
  getCurrentUser: vi.fn(async () => null),
  isActiveMember: vi.fn(async () => false),
}));

const pagination = { page: 1, pageSize: 12, totalCount: 0, totalPages: 1 };

const catalogProduct: CatalogProduct = {
  availableQuantity: 9,
  brandName: "Bagley",
  categoryId: "category-1",
  categoryName: "Galletitas",
  description: "Galletitas de chocolate en presentación de 250 g.",
  id: "product-1",
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

describe("páginas públicas iniciales", () => {
  it("renderiza la Home y sus llamados a la acción", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Abastecé tu comercio de forma simple.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver catálogo/i })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(screen.getByRole("link", { name: /ingresar como cliente/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("renderiza el estado vacío del catálogo", () => {
    render(<CatalogContent categories={[]} pagination={pagination} products={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Catálogo mayorista" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/todavía no hay productos activos/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar sesión para ver precios/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("muestra datos públicos, promoción y destacado sin exponer precios", () => {
    render(
      <CatalogContent
        categories={[
          { id: "category-1", name: "Galletitas", parentId: null, slug: "galletitas" },
          { id: "category-2", name: "Dulces", parentId: "category-1", slug: "dulces" },
        ]}
        pagination={{ ...pagination, totalCount: 1 }}
        parentCategoryId="category-1"
        products={[catalogProduct]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Chocolina 250 g" })).toBeInTheDocument();
    expect(screen.getByText("Bagley")).toBeInTheDocument();
    expect(screen.getAllByText("Galletitas")).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Dulces" })).toBeInTheDocument();
    expect(screen.getByText("Stock bajo")).toBeInTheDocument();
    expect(screen.getByText("Destacado")).toBeInTheDocument();
    expect(screen.getByText("Oferta")).toBeInTheDocument();
    expect(screen.queryByText(/\$|precio:/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver chocolina 250 g/i })).toHaveAttribute(
      "href",
      "/catalogo/chocolina-250-g",
    );
  });

  it("renderiza el acceso con formulario de inicio de sesión", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Ingresá a LogiMarket" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrate" })).toHaveAttribute("href", "/registro");
  });
});

describe("navegación principal", () => {
  it("expone destinos públicos y acceso para visitantes", async () => {
    render(<CartProvider>{await SiteHeader()}</CartProvider>);

    expect(screen.getByRole("link", { name: "LogiMarket" })).toHaveAttribute("href", "/");

    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(navigation).getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(within(navigation).getByRole("link", { name: "Promociones" })).toHaveAttribute(
      "href",
      "/#promociones",
    );
    expect(within(navigation).getByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: /ver carrito/i })).toHaveAttribute("href", "/carrito");
  });
});
