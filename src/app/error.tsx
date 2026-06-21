"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">Algo salió mal</p>
      <h1 className="mt-3 text-3xl font-black">No pudimos cargar esta página</h1>
      <p className="mt-3 text-muted-foreground">Intentá nuevamente en unos instantes.</p>
      <Button className="mt-7" onClick={reset}>Reintentar</Button>
    </div>
  );
}
