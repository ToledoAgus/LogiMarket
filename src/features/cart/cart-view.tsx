"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { priceKindLabels } from "@/features/catalog/price-format";
import { formatCents } from "@/lib/money";

import { useCart } from "./cart-provider";

export function CartView() {
  const { count, hydrated, items, removeItem, setQuantity, subtotalCents } = useCart();

  if (!hydrated) {
    return <p className="mt-8 text-muted-foreground">Cargando carrito…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border bg-card p-8 text-center shadow-card">
        <p className="text-lg font-bold">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Agregá productos desde el catálogo para armar tu pedido.
        </p>
        <Button asChild className="mt-5" size="lg">
          <Link href="/catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="space-y-3">
        {items.map((item) => {
          const minQuantity = item.requiresMinimumPurchase ? item.minimumQuantity : 1;
          const lineSubtotal = item.quantity * item.unitPriceCents;
          return (
            <li
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
              key={`${item.productId}:${item.priceKind}`}
            >
              <div className="min-w-0">
                <Link className="font-bold hover:text-primary" href={`/catalogo/${item.slug}`}>
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.brandName ?? "Sin marca"} · {priceKindLabels[item.priceKind]} ·{" "}
                  {formatCents(item.unitPriceCents)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border">
                  <button
                    aria-label="Restar"
                    className="flex size-10 items-center justify-center disabled:opacity-40"
                    disabled={item.quantity <= minQuantity}
                    onClick={() => setQuantity(item.productId, item.priceKind, item.quantity - 1)}
                    type="button"
                  >
                    <Minus aria-hidden="true" className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    aria-label="Sumar"
                    className="flex size-10 items-center justify-center disabled:opacity-40"
                    disabled={item.quantity >= item.availableQuantity}
                    onClick={() => setQuantity(item.productId, item.priceKind, item.quantity + 1)}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <p className="w-24 text-right font-bold">{formatCents(lineSubtotal)}</p>

                <button
                  aria-label={`Quitar ${item.name}`}
                  className="flex size-10 items-center justify-center text-muted-foreground hover:text-red-600"
                  onClick={() => removeItem(item.productId, item.priceKind)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-xl border bg-card p-5 shadow-card">
        <h2 className="text-lg font-bold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Productos</dt>
            <dd className="font-semibold">{count}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base">
            <dt className="font-bold">Subtotal estimado</dt>
            <dd className="font-black text-primary">{formatCents(subtotalCents)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          El total final se confirma en el checkout con precios y stock vigentes.
        </p>
        <Button asChild className="mt-5 w-full" size="lg">
          <Link href="/checkout">Continuar al checkout</Link>
        </Button>
      </aside>
    </div>
  );
}
