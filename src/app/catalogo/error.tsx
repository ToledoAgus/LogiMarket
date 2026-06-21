"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <AlertTriangle aria-hidden="true" className="size-11 text-accent" />
      <h1 className="mt-4 text-3xl font-black">No pudimos cargar el catálogo</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Revisá tu conexión e intentá nuevamente. No se mostraron datos alternativos.
      </p>
      <Button className="mt-7" onClick={reset}>Reintentar</Button>
    </div>
  );
}
