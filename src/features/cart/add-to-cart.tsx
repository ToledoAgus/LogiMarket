"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { priceKindLabels, type ProductPrice } from "@/features/catalog/price-format";
import { formatCents } from "@/lib/money";

import { useCart } from "./cart-provider";

export type AddToCartProduct = {
  availableQuantity: number;
  brandName: string | null;
  imageUrl: string | null;
  minimumQuantity: number;
  name: string;
  productId: string;
  requiresMinimumPurchase: boolean;
  salesUnit: string;
  slug: string;
};

export function AddToCart({
  prices,
  product,
}: {
  prices: ProductPrice[];
  product: AddToCartProduct;
}) {
  const minQuantity = product.requiresMinimumPurchase ? product.minimumQuantity : 1;
  const [kind, setKind] = useState(prices[0]?.kind);
  const [quantity, setQuantity] = useState(minQuantity);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const outOfStock = product.availableQuantity <= 0;
  const selectedPrice = prices.find((price) => price.kind === kind) ?? prices[0];

  if (!selectedPrice) return null;

  const belowMinimum = quantity < minQuantity;
  const overStock = quantity > product.availableQuantity;
  const canAdd = !outOfStock && !belowMinimum && !overStock;

  function handleAdd() {
    if (!canAdd || !selectedPrice) return;
    addItem({
      availableQuantity: product.availableQuantity,
      brandName: product.brandName,
      imageUrl: product.imageUrl,
      minimumQuantity: product.minimumQuantity,
      name: product.name,
      priceKind: selectedPrice.kind,
      productId: product.productId,
      quantity,
      requiresMinimumPurchase: product.requiresMinimumPurchase,
      salesUnit: product.salesUnit,
      slug: product.slug,
      unitPriceCents: selectedPrice.amountCents,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
      {prices.length > 1 ? (
        <label className="block text-sm">
          <span className="font-semibold">Presentación</span>
          <select
            className="mt-1.5 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onChange={(event) => setKind(event.target.value as ProductPrice["kind"])}
            value={kind}
          >
            {prices.map((price) => (
              <option key={price.kind} value={price.kind}>
                {priceKindLabels[price.kind]} — {formatCents(price.amountCents)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <p className="mt-3 text-3xl font-black text-primary">
        {formatCents(selectedPrice.amountCents)}
        <span className="ml-2 text-sm font-semibold text-muted-foreground">
          por {priceKindLabels[selectedPrice.kind].toLowerCase()}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="font-semibold">Cantidad</span>
          <input
            className="mt-1.5 min-h-11 w-28 rounded-md border border-border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            min={minQuantity}
            onChange={(event) => setQuantity(Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
            type="number"
            value={quantity}
          />
        </label>
        <Button className="flex-1 sm:flex-none" disabled={!canAdd} onClick={handleAdd} size="lg">
          <ShoppingCart aria-hidden="true" className="size-4" /> Agregar al carrito
        </Button>
      </div>

      {product.requiresMinimumPurchase ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Compra mínima: {product.minimumQuantity} {product.salesUnit}.
        </p>
      ) : null}

      {outOfStock ? (
        <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">Sin stock disponible.</p>
      ) : belowMinimum ? (
        <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
          La cantidad mínima es {minQuantity}.
        </p>
      ) : overStock ? (
        <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
          Solo hay {product.availableQuantity} disponibles.
        </p>
      ) : null}

      {added ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary" role="status">
          <Check aria-hidden="true" className="size-4" /> Agregado.{" "}
          <Link className="underline" href="/carrito">
            Ver carrito
          </Link>
        </p>
      ) : null}
    </div>
  );
}
