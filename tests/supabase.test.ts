import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getSupabasePublicEnv } from "@/lib/env";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/202606200001_initial_schema.sql",
);
const migration = readFileSync(migrationPath, "utf8");

describe("Supabase environment", () => {
  it("accepts a valid public URL and anon key", () => {
    expect(
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("fails closed when Supabase public configuration is missing", () => {
    expect(() => getSupabasePublicEnv({})).toThrow();
  });
});

describe("initial RLS contract", () => {
  it("enables RLS on every application table", () => {
    const tables = [
      "organizations",
      "profiles",
      "organization_members",
      "customers",
      "brands",
      "categories",
      "products",
      "product_images",
      "inventory",
      "inventory_movements",
      "price_lists",
      "product_prices",
      "price_history",
      "promotions",
      "promotion_products",
      "orders",
      "order_items",
      "order_status_history",
    ];

    tables.forEach((table) => {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    });
  });

  it("keeps prices out of the public catalog and grants price reads only to authenticated users", () => {
    const catalogView = migration.match(
      /create view public\.public_catalog_products[\s\S]+?comment on view/,
    )?.[0];

    expect(catalogView).toBeDefined();
    expect(catalogView).not.toContain("amount_cents");
    expect(migration).toMatch(
      /create policy product_prices_member_select on public\.product_prices\s+for select to authenticated/,
    );
    expect(migration).not.toMatch(
      /on public\.product_prices\s+for select to anon/,
    );
  });
});
