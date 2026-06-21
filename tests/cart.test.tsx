import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ProductDetail } from "@/features/catalog/product-detail";
import { CartProvider, useCart } from "@/features/cart/cart-provider";
import type { CartItem } from "@/features/cart/types";
import type { CatalogProduct } from "@/features/catalog/types";
import { formatCents } from "@/lib/money";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const baseItem: CartItem = {
  availableQuantity: 80,
  brandName: "Bagley",
  imageUrl: null,
  minimumQuantity: 3,
  name: "Surtido Bagley",
  priceKind: "unit",
  productId: "00000000-0000-4000-8000-000000000301",
  quantity: 3,
  requiresMinimumPurchase: true,
  salesUnit: "paquete",
  slug: "surtido-bagley",
  unitPriceCents: 285000,
};

const product: CatalogProduct = {
  availableQuantity: 80,
  brandName: "Bagley",
  categoryId: "c1",
  categoryName: "Galletitas",
  description: "Surtido de galletitas.",
  id: "00000000-0000-4000-8000-000000000301",
  image: null,
  internalCode: "GAL-SUR-BAG",
  isFeatured: true,
  minimumQuantity: 3,
  name: "Surtido Bagley",
  promotions: [],
  requiresMinimumPurchase: true,
  salesUnit: "paquete",
  slug: "surtido-bagley",
  stockStatus: "available",
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("carrito con persistencia local", () => {
  it("fusiona la misma presentación y acumula cantidades", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(baseItem));
    act(() => result.current.addItem(baseItem));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(6);
    expect(result.current.count).toBe(6);
    expect(result.current.subtotalCents).toBe(6 * 285000);
  });

  it("separa líneas por presentación distinta", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(baseItem));
    act(() => result.current.addItem({ ...baseItem, priceKind: "box", unitPriceCents: 3240000 }));

    expect(result.current.items).toHaveLength(2);
  });

  it("elimina la línea al fijar cantidad cero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(baseItem));
    act(() => result.current.setQuantity(baseItem.productId, "unit", 0));

    expect(result.current.items).toHaveLength(0);
    expect(result.current.subtotalCents).toBe(0);
  });

  it("persiste el carrito en localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(baseItem));

    const stored = window.localStorage.getItem("logimarket-cart-v1");
    expect(stored).toContain(baseItem.productId);
  });
});

describe("detalle de producto según sesión", () => {
  it("muestra precio y acción de compra para miembros", () => {
    render(
      <CartProvider>
        <ProductDetail
          prices={[{ amountCents: 285000, kind: "unit", unitsIncluded: 1 }]}
          product={product}
        />
      </CartProvider>,
    );

    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /iniciar sesión para ver precios/i }),
    ).not.toBeInTheDocument();
  });

  it("oculta precios y ofrece login a visitantes", () => {
    render(
      <CartProvider>
        <ProductDetail prices={[]} product={product} />
      </CartProvider>,
    );

    expect(
      screen.getByRole("link", { name: /iniciar sesión para ver precios/i }),
    ).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /agregar al carrito/i })).not.toBeInTheDocument();
  });
});

describe("formato de dinero", () => {
  it("formatea centavos a moneda argentina", () => {
    expect(formatCents(285000)).toContain("2.850");
    expect(formatCents(95000)).toContain("950");
  });
});
