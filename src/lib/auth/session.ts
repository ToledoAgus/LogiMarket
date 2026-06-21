import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActiveCustomer = {
  id: string;
  organizationId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string | null;
  address: string | null;
};

/** Usuario autenticado de la sesión actual, validado contra Supabase Auth. */
export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Indica si el usuario es miembro activo de alguna organización. Es el permiso
 * mínimo para ver precios; se resuelve por `organization_members`, no por
 * metadata editable (ADR-003).
 */
export const isActiveMember = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("organization_members")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return Boolean(data);
});

/**
 * Ficha de cliente activa del usuario. Requisito para armar el carrito y crear
 * pedidos. Devuelve null para visitantes o usuarios sin ficha aprobada.
 */
export const getActiveCustomer = cache(async (): Promise<ActiveCustomer | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("customers")
    .select("id, organization_id, business_name, owner_name, phone, email, address, status")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    address: data.address,
    businessName: data.business_name,
    email: data.email,
    id: data.id,
    organizationId: data.organization_id,
    ownerName: data.owner_name,
    phone: data.phone,
  };
});
