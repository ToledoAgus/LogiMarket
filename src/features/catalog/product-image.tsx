import Image from "next/image";
import { PackageOpen } from "lucide-react";

import type { CatalogImage } from "./types";

export function ProductImage({ image, name, priority = false, sizes }: {
  image: CatalogImage | null;
  name: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      {image ? (
        <Image
          alt={image.alt}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
          src={image.url}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <PackageOpen aria-hidden="true" className="size-12" />
          <span className="text-sm">Imagen no disponible</span>
          <span className="sr-only">{name}</span>
        </div>
      )}
    </div>
  );
}
