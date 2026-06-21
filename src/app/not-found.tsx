import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Error 404</p>
      <h1 className="mt-3 text-4xl font-black">No encontramos esa página</h1>
      <p className="mt-3 text-muted-foreground">Volvé al inicio para seguir navegando.</p>
      <Button asChild className="mt-7">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
