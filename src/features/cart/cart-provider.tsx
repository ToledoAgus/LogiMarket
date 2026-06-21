"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { PriceKind } from "@/features/catalog/price-format";

import { cartLineKey, type CartItem } from "./types";

const STORAGE_KEY = "logimarket-cart-v1";

type CartContextValue = {
  addItem: (item: CartItem) => void;
  clear: () => void;
  count: number;
  hydrated: boolean;
  items: CartItem[];
  removeItem: (productId: string, priceKind: PriceKind) => void;
  setQuantity: (productId: string, priceKind: PriceKind, quantity: number) => void;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function isValidItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.priceKind === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPriceCents === "number"
  );
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Almacenamiento no disponible (modo privado / cuota): el carrito vive en memoria.
    }
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const key = cartLineKey(item.productId, item.priceKind);
      const existing = current.find(
        (line) => cartLineKey(line.productId, line.priceKind) === key,
      );
      if (existing) {
        return current.map((line) =>
          cartLineKey(line.productId, line.priceKind) === key
            ? { ...line, quantity: line.quantity + item.quantity }
            : line,
        );
      }
      return [...current, item];
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, priceKind: PriceKind, quantity: number) => {
      setItems((current) =>
        current.flatMap((line) => {
          if (cartLineKey(line.productId, line.priceKind) !== cartLineKey(productId, priceKind)) {
            return [line];
          }
          if (quantity <= 0) return [];
          return [{ ...line, quantity }];
        }),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, priceKind: PriceKind) => {
    setItems((current) =>
      current.filter(
        (line) => cartLineKey(line.productId, line.priceKind) !== cartLineKey(productId, priceKind),
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, line) => total + line.quantity, 0);
    const subtotalCents = items.reduce(
      (total, line) => total + line.quantity * line.unitPriceCents,
      0,
    );
    return { addItem, clear, count, hydrated, items, removeItem, setQuantity, subtotalCents };
  }, [addItem, clear, hydrated, items, removeItem, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }
  return context;
}
