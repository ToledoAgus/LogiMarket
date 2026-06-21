import Link from "next/link";
import { LogOut, Menu } from "lucide-react";

import { ThemeSelector } from "@/components/theme/theme-selector";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { CartButton } from "@/features/cart/cart-button";
import { getCurrentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link
          className="text-xl font-black tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href="/"
        >
          Logi<span className="text-accent">Market</span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
          <Link className="text-sm font-medium hover:text-primary" href="/catalogo">
            Catálogo
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="/#promociones">
            Promociones
          </Link>
          {user ? (
            <form action={logoutAction}>
              <button
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
                type="submit"
              >
                <LogOut aria-hidden="true" className="size-4" /> Salir
              </button>
            </form>
          ) : (
            <Link className="text-sm font-medium hover:text-primary" href="/login">
              Ingresar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeSelector />
          <CartButton />
          <Button aria-label="Abrir menú" className="md:hidden" size="icon" variant="ghost">
            <Menu aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
