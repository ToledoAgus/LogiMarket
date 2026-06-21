import type { Database } from "@/types/database.generated";

export type StockStatus = Database["public"]["Enums"]["stock_status"];

export type CatalogImage = {
  alt: string;
  url: string;
};

export type CatalogPromotion = {
  id: string;
  label: string;
};

export type CatalogProduct = {
  availableQuantity: number;
  brandName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
  id: string;
  image: CatalogImage | null;
  internalCode: string;
  isFeatured: boolean;
  minimumQuantity: number;
  name: string;
  promotions: CatalogPromotion[];
  requiresMinimumPurchase: boolean;
  salesUnit: string;
  slug: string;
  stockStatus: StockStatus;
};

export type CatalogCategory = {
  id: string;
  name: string;
  parentId: string | null;
  slug: string;
};

export type CatalogPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
