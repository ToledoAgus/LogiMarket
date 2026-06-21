import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Catálogo" };

export default function CatalogPage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Productos</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Catálogo mayorista</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            La carga del catálogo se habilitará al conectar el esquema seguro de Supabase.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/login">
            <LockKeyhole aria-hidden="true" className="size-4" /> Ver precios
          </Link>
        </Button>
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-14">
        <Search aria-hidden="true" className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-xl font-bold">Catálogo en preparación</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          No se muestran productos simulados. Esta pantalla utilizará únicamente datos
          vigentes de Supabase.
        </p>
      </div>
    </div>
  );
}
