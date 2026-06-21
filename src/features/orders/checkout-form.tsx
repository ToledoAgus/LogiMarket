"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { formatCents } from "@/lib/money";

import { placeOrderAction } from "./actions";
import type { PlaceOrderResult } from "./schemas";

export type CheckoutDefaults = {
  address: string;
  businessName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type Success = Extract<PlaceOrderResult, { ok: true }>;

export function CheckoutForm({ defaults }: { defaults: CheckoutDefaults }) {
  const { clear, hydrated, items, subtotalCents } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);

  if (success) {
    return (
      <div className="mt-8 rounded-2xl border bg-card p-8 text-center shadow-card">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Pedido confirmado</p>
        <h2 className="mt-2 text-2xl font-black">N.º {success.orderNumber}</h2>
        <p className="mt-2 text-muted-foreground">
          Total estimado: <span className="font-bold">{formatCents(success.totalCents)}</span>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Tu pedido quedó registrado. Enviá el detalle por WhatsApp para coordinar la entrega.
        </p>
        <Button asChild className="mt-5" size="lg" variant="accent">
          <a href={success.whatsappUrl} rel="noopener noreferrer" target="_blank">
            <Send aria-hidden="true" className="size-4" /> Enviar pedido por WhatsApp
          </a>
        </Button>
        <div className="mt-4">
          <Link className="text-sm font-semibold text-primary hover:underline" href="/catalogo">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return <p className="mt-8 text-muted-foreground">Cargando…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border bg-card p-8 text-center shadow-card">
        <p className="text-lg font-bold">No hay productos en tu carrito</p>
        <Button asChild className="mt-5" size="lg">
          <Link href="/catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    const result = await placeOrderAction({
      address: String(formData.get("address") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
      email: String(formData.get("email") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      items: items.map((item) => ({
        priceKind: item.priceKind,
        productId: item.productId,
        quantity: item.quantity,
      })),
      lastName: String(formData.get("lastName") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });

    setSubmitting(false);
    if (result.ok) {
      clear();
      setSuccess(result);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input defaultValue={defaults.firstName} label="Nombre" name="firstName" />
          <Input defaultValue={defaults.lastName} label="Apellido" name="lastName" />
        </div>
        <Input defaultValue={defaults.businessName} label="Comercio" name="businessName" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input defaultValue={defaults.phone} label="Teléfono" name="phone" type="tel" />
          <Input defaultValue={defaults.email} label="Email (opcional)" name="email" required={false} type="email" />
        </div>
        <Input defaultValue={defaults.address} label="Dirección de entrega" name="address" />
        <label className="block text-sm">
          <span className="font-semibold">Observaciones (opcional)</span>
          <textarea
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            name="notes"
            rows={3}
          />
        </label>

        {error ? (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <aside className="h-fit rounded-xl border bg-card p-5 shadow-card">
        <h2 className="text-lg font-bold">Resumen</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <li className="flex justify-between gap-2" key={`${item.productId}:${item.priceKind}`}>
              <span className="min-w-0 truncate text-muted-foreground">
                {item.quantity}× {item.name}
              </span>
              <span className="font-semibold">{formatCents(item.quantity * item.unitPriceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 text-base">
          <span className="font-bold">Subtotal estimado</span>
          <span className="font-black text-primary">{formatCents(subtotalCents)}</span>
        </div>
        <Button className="mt-5 w-full" disabled={submitting} size="lg" type="submit">
          {submitting ? "Creando pedido…" : "Confirmar pedido"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          El total se recalcula en el servidor con precios y stock vigentes.
        </p>
      </aside>
    </form>
  );
}

function Input({
  defaultValue,
  label,
  name,
  required = true,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      <input
        className="mt-1.5 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
