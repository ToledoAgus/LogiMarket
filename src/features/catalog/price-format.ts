import type { Database } from "@/types/database.generated";

export type PriceKind = Database["public"]["Enums"]["price_kind"];

export type ProductPrice = {
  amountCents: number;
  kind: PriceKind;
  unitsIncluded: number;
};

export type ProductPriceMap = Map<string, ProductPrice[]>;

export const priceKindLabels: Record<PriceKind, string> = {
  box: "Caja",
  bulk: "Bulto",
  display: "Display",
  unit: "Unidad",
};

export const priceKindOrder: PriceKind[] = ["unit", "box", "display", "bulk"];
