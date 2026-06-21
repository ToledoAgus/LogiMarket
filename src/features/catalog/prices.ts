import { createServerSupabaseClient } from "@/lib/supabase/server";

import { priceKindOrder, type ProductPriceMap } from "./price-format";

export type { PriceKind, ProductPrice, ProductPriceMap } from "./price-format";

/**
 * Resuelve los precios vigentes por producto para el usuario autenticado.
 * La política RLS `product_prices_member_select` garantiza que solo miembros
 * activos reciban importes; visitantes obtienen un mapa vacío (ADR-004).
 */
export async function getApplicablePrices(productIds: string[]): Promise<ProductPriceMap> {
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length === 0) return new Map();

  const supabase = await createServerSupabaseClient();

  const { data: lists, error: listError } = await supabase
    .from("price_lists")
    .select("id")
    .order("priority", { ascending: false })
    .limit(1);

  if (listError) throw listError;
  const listId = lists?.[0]?.id;
  if (!listId) return new Map();

  const { data: prices, error: pricesError } = await supabase
    .from("product_prices")
    .select("product_id, kind, amount_cents, units_included")
    .eq("price_list_id", listId)
    .in("product_id", uniqueIds);

  if (pricesError) throw pricesError;

  const map: ProductPriceMap = new Map();
  for (const price of prices ?? []) {
    const current = map.get(price.product_id) ?? [];
    current.push({
      amountCents: Number(price.amount_cents),
      kind: price.kind,
      unitsIncluded: price.units_included,
    });
    map.set(price.product_id, current);
  }

  for (const [productId, list] of map) {
    list.sort((a, b) => priceKindOrder.indexOf(a.kind) - priceKindOrder.indexOf(b.kind));
    map.set(productId, list);
  }

  return map;
}
