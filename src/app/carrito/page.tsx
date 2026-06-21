import type { Metadata } from "next";

import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="container py-8 sm:py-12">
      <h1 className="text-3xl font-black sm:text-4xl">Tu carrito</h1>
      <p className="mt-2 text-muted-foreground">Revisá las cantidades antes de enviar tu pedido.</p>
      <CartView />
    </div>
  );
}
