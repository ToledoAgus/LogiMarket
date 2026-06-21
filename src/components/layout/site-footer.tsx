import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container grid gap-6 py-10 text-sm sm:grid-cols-2">
        <div>
          <p className="text-lg font-black text-primary">LogiMarket</p>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Catálogo mayorista y pedidos online para tu comercio.
          </p>
        </div>
        <div className="sm:text-right">
          <Link className="font-semibold hover:text-primary" href="/catalogo">
            Explorar catálogo
          </Link>
          <p className="mt-2 text-muted-foreground">WhatsApp: +54 9 11 5146-1419</p>
        </div>
      </div>
    </footer>
  );
}
