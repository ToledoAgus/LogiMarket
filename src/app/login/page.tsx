import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-2xl bg-card p-7 shadow-card sm:p-9">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Clientes</p>
        <h1 className="mt-2 text-3xl font-black">Ingresá a LogiMarket</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          El acceso se habilitará en el Sprint 1 junto con Supabase Auth y sus políticas
          de seguridad. No se aceptarán credenciales hasta entonces.
        </p>
      </section>
    </div>
  );
}
