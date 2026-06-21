import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/catalogo");

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-2xl bg-card p-7 shadow-card sm:p-9">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Clientes</p>
        <h1 className="mt-2 text-3xl font-black">Creá tu cuenta</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Registrá tu comercio para acceder a precios mayoristas y realizar pedidos.
        </p>
        <RegisterForm />
      </section>
    </div>
  );
}
