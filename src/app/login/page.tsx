import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Ingresar" };

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = (await searchParams) ?? {};
  const redirectToRaw = firstValue(resolved.redirectTo);
  const redirectTo = redirectToRaw?.startsWith("/") ? redirectToRaw : "/catalogo";

  const user = await getCurrentUser();
  if (user) redirect(redirectTo as Route);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-2xl bg-card p-7 shadow-card sm:p-9">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Clientes</p>
        <h1 className="mt-2 text-3xl font-black">Ingresá a LogiMarket</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Accedé para ver precios mayoristas, armar tu pedido y enviarlo por WhatsApp.
        </p>
        <LoginForm justRegistered={firstValue(resolved.registered) === "1"} redirectTo={redirectTo} />
      </section>
    </div>
  );
}
