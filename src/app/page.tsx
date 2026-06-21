import Link from "next/link";
import { ArrowRight, BadgePercent, PackageCheck, Store } from "lucide-react";

import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Store,
    title: "Pensado para tu comercio",
    description: "Encontrá productos mayoristas por categoría, marca o promoción.",
  },
  {
    icon: PackageCheck,
    title: "Disponibilidad clara",
    description: "Consultá productos vigentes y prepará tu próximo pedido desde el celular.",
  },
  {
    icon: BadgePercent,
    title: "Precios para clientes",
    description: "Ingresá con tu cuenta para acceder a precios y condiciones comerciales.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-800 text-primary-foreground">
        <div className="container grid min-h-[480px] items-center gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Mayorista online
            </p>
            <h1 className="max-w-3xl text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Abastecé tu comercio de forma simple.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-blue-50 sm:text-xl">
              Explorá el catálogo de LogiMarket. Iniciá sesión para consultar precios y
              generar tus pedidos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-white text-primary hover:bg-blue-50" size="lg">
                <Link href="/catalogo">
                  Ver catálogo <ArrowRight aria-hidden="true" className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
                size="lg"
                variant="outline"
              >
                <Link href="/login">Ingresar como cliente</Link>
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="mx-auto aspect-square w-full max-w-sm rounded-[2.5rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm"
          >
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white/20" />
              <div className="translate-y-8 rounded-3xl bg-accent" />
              <div className="-translate-y-4 rounded-3xl bg-white" />
              <div className="translate-y-4 rounded-3xl bg-blue-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-20" id="promociones">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article className="rounded-2xl bg-card p-6 shadow-card" key={title}>
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
