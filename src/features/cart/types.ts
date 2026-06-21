import type { PriceKind } from "@/features/catalog/price-format";

export type CartItem = {
  availableQuantity: number;
  brandName: string | null;
  imageUrl: string | null;
  minimumQuantity: number;
  name: string;
  priceKind: PriceKind;
  productId: string;
  quantity: number;
  requiresMinimumPurchase: boolean;
  salesUnit: string;
  slug: string;
  /** Importe de referencia para el subtotal estimado; el servidor recalcula en checkout. */
  unitPriceCents: number;
};

export type CartLineKey = `${string}:${PriceKind}`;

export function cartLineKey(productId: string, priceKind: PriceKind): CartLineKey {
  return `${productId}:${priceKind}`;
}
