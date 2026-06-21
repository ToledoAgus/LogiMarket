export default function CatalogLoading() {
  return (
    <div aria-label="Cargando catálogo" className="container py-10 sm:py-14" role="status">
      <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-10 w-72 max-w-full animate-pulse rounded bg-muted" />
      <div className="mt-8 h-24 animate-pulse rounded-2xl bg-muted" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="h-[28rem] animate-pulse rounded-2xl bg-muted" key={index} />
        ))}
      </div>
      <span className="sr-only">Cargando productos...</span>
    </div>
  );
}
