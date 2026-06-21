export default function Loading() {
  return (
    <div aria-label="Cargando" className="container py-14" role="status">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-64 animate-pulse rounded-2xl bg-muted" key={index} />
        ))}
      </div>
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
}
