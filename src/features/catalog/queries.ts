import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.generated";

import type { CatalogCategory, CatalogProduct } from "./types";

type CatalogRow = Database["public"]["Views"]["public_catalog_products"]["Row"];

type CatalogFilters = {
  page?: number;
  parentCategoryId?: string;
  search?: string;
  subcategoryId?: string;
};

export const CATALOG_PAGE_SIZE = 12;

export function collectCategoryIds(categories: CatalogCategory[], rootId: string) {
  const collected = new Set([rootId]);
  let added = true;

  while (added) {
    added = false;
    categories.forEach((category) => {
      if (category.parentId && collected.has(category.parentId) && !collected.has(category.id)) {
        collected.add(category.id);
        added = true;
      }
    });
  }

  return [...collected];
}

function normalizeProduct(row: CatalogRow): Omit<CatalogProduct, "image" | "promotions"> {
  if (!row.id || !row.internal_code || !row.name || !row.slug) {
    throw new Error("Supabase devolvió un producto público incompleto.");
  }

  return {
    availableQuantity: row.available_quantity ?? 0,
    brandName: row.brand_name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
    id: row.id,
    internalCode: row.internal_code,
    isFeatured: row.is_featured ?? false,
    minimumQuantity: row.minimum_quantity ?? 1,
    name: row.name,
    requiresMinimumPurchase: row.requires_minimum_purchase ?? false,
    salesUnit: row.sales_unit ?? "unidad",
    slug: row.slug,
    stockStatus: row.stock_status ?? "out_of_stock",
  };
}

async function enrichProducts(
  rows: CatalogRow[],
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
): Promise<CatalogProduct[]> {
  const products = rows.map(normalizeProduct);
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) return [];

  const [imagesResult, linksResult] = await Promise.all([
    supabase
      .from("product_images")
      .select("product_id, storage_path, alt_text, is_primary, sort_order")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true }),
    supabase
      .from("promotion_products")
      .select("product_id, promotion_id")
      .in("product_id", productIds),
  ]);

  if (imagesResult.error) throw imagesResult.error;
  if (linksResult.error) throw linksResult.error;

  const promotionIds = [...new Set(linksResult.data.map((link) => link.promotion_id))];
  const promotionsResult = promotionIds.length
    ? await supabase
        .from("promotions")
        .select("id, label")
        .in("id", promotionIds)
        .order("priority", { ascending: false })
    : { data: [], error: null };

  if (promotionsResult.error) throw promotionsResult.error;

  const promotionById = new Map(
    promotionsResult.data.map((promotion) => [promotion.id, promotion.label]),
  );
  const promotionIdsByProduct = new Map<string, string[]>();

  linksResult.data.forEach((link) => {
    const current = promotionIdsByProduct.get(link.product_id) ?? [];
    current.push(link.promotion_id);
    promotionIdsByProduct.set(link.product_id, current);
  });

  return products.map((product) => {
    const primaryImage = imagesResult.data.find((image) => image.product_id === product.id);
    const promotionIdsForProduct = promotionIdsByProduct.get(product.id) ?? [];

    return {
      ...product,
      image: primaryImage
        ? {
            alt: primaryImage.alt_text || product.name,
            url: supabase.storage.from("product-images").getPublicUrl(primaryImage.storage_path)
              .data.publicUrl,
          }
        : null,
      promotions: promotionIdsForProduct.flatMap((id) => {
        const label = promotionById.get(id);
        return label ? [{ id, label }] : [];
      }),
    };
  });
}

export async function getCatalog(filters: CatalogFilters = {}) {
  const supabase = await createServerSupabaseClient();
  const categoriesResult = await supabase
    .from("categories")
    .select("id, name, parent_id, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (categoriesResult.error) throw categoriesResult.error;

  const categories: CatalogCategory[] = categoriesResult.data.map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parent_id,
    slug: category.slug,
  }));
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * CATALOG_PAGE_SIZE;
  let productsQuery = supabase
    .from("public_catalog_products")
    .select("*", { count: "exact" })
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .range(offset, offset + CATALOG_PAGE_SIZE - 1);

  const search = filters.search?.trim();
  if (search) productsQuery = productsQuery.ilike("name", `%${search}%`);
  const parentCategoryIds = filters.parentCategoryId
    ? collectCategoryIds(categories, filters.parentCategoryId)
    : [];
  const validSubcategoryId = filters.subcategoryId
    && (!filters.parentCategoryId || parentCategoryIds.includes(filters.subcategoryId))
    && categories.some((category) => category.id === filters.subcategoryId)
    ? filters.subcategoryId
    : undefined;

  if (validSubcategoryId) {
    productsQuery = productsQuery.in(
      "category_id",
      collectCategoryIds(categories, validSubcategoryId),
    );
  } else if (filters.parentCategoryId) {
    productsQuery = productsQuery.in("category_id", parentCategoryIds);
  }

  const productsResult = await productsQuery;

  if (productsResult.error) throw productsResult.error;
  const totalCount = productsResult.count ?? 0;

  return {
    categories,
    pagination: {
      page,
      pageSize: CATALOG_PAGE_SIZE,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / CATALOG_PAGE_SIZE)),
    },
    products: await enrichProducts(productsResult.data, supabase),
  };
}

export const getCatalogProduct = cache(async (slug: string) => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("public_catalog_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [product] = await enrichProducts([data], supabase);
  return product ?? null;
});
