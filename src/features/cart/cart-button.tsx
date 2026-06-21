"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, hydrated } = useCart();

  return (
    <Link
      aria-label={`Ver carrito${hydrated && count > 0 ? ` (${count})` : ""}`}
      className="relative inline-flex size-11 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      href="/carrito"
    >
      <ShoppingCart aria-hidden="true" className="size-5" />
      {hydrated && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
