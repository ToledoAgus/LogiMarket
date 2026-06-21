import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/features/orders/checkout-form";
import { getActiveCustomer, getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/checkout");

  const customer = await getActiveCustomer();

  if (!customer) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <h1 className="text-2xl font-black">Cuenta en revisión</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tu cuenta todavía no está habilitada como cliente activo para realizar pedidos.
          </p>
          <Button asChild className="mt-5">
            <Link href="/catalogo">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [firstName, ...rest] = customer.ownerName.split(" ");

  return (
    <div className="container py-8 sm:py-12">
      <h1 className="text-3xl font-black sm:text-4xl">Finalizá tu pedido</h1>
      <p className="mt-2 text-muted-foreground">
        Confirmá tus datos de contacto y entrega. El pedido se registra y se comparte por WhatsApp.
      </p>
      <CheckoutForm
        defaults={{
          address: customer.address ?? "",
          businessName: customer.businessName,
          email: customer.email ?? "",
          firstName: firstName ?? customer.ownerName,
          lastName: rest.join(" "),
          phone: customer.phone,
        }}
      />
    </div>
  );
}
