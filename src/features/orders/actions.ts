"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveCustomer } from "@/lib/auth/session";

import { checkoutSchema, type CheckoutInput, type PlaceOrderResult } from "./schemas";
import { buildWhatsappUrl } from "./whatsapp";

const FALLBACK_WHATSAPP = "+5491151461419";

export async function placeOrderAction(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos.", ok: false };
  }

  const customer = await getActiveCustomer();
  if (!customer) {
    return { error: "Necesitás una cuenta de cliente activa para realizar pedidos.", ok: false };
  }

  const data = parsed.data;
  const supabase = await createServerSupabaseClient();

  const { data: result, error } = await supabase.rpc("place_order", {
    p_business_name: data.businessName,
    p_delivery_address: data.address,
    p_email: data.email ?? "",
    p_first_name: data.firstName,
    p_items: data.items.map((item) => ({
      price_kind: item.priceKind,
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_last_name: data.lastName,
    p_notes: data.notes ?? "",
    p_phone: data.phone,
  });

  const order = result?.[0];
  if (error || !order) {
    return {
      error: translateOrderError(error?.message),
      ok: false,
    };
  }

  // Snapshots autoritativos del pedido para el mensaje (no se usan importes del cliente).
  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, price_kind, quantity, subtotal_cents")
    .eq("order_id", order.order_id)
    .order("created_at", { ascending: true });

  const { data: organization } = await supabase
    .from("organizations")
    .select("whatsapp")
    .eq("id", customer.organizationId)
    .maybeSingle();

  const whatsappUrl = buildWhatsappUrl({
    businessName: data.businessName,
    customerName: `${data.firstName} ${data.lastName}`.trim(),
    lines: (items ?? []).map((item) => ({
      priceKind: item.price_kind,
      productName: item.product_name,
      quantity: item.quantity,
      subtotalCents: Number(item.subtotal_cents),
    })),
    notes: data.notes && data.notes.length > 0 ? data.notes : null,
    orderNumber: order.order_number,
    phoneNumber: organization?.whatsapp ?? FALLBACK_WHATSAPP,
    totalCents: Number(order.total_cents),
  });

  return {
    ok: true,
    orderNumber: order.order_number,
    totalCents: Number(order.total_cents),
    whatsappUrl,
  };
}

function translateOrderError(message: string | undefined): string {
  if (!message) return "No pudimos crear el pedido. Probá nuevamente.";
  if (message.includes("minimum quantity")) {
    return "Una línea no alcanza la cantidad mínima de compra.";
  }
  if (message.includes("insufficient stock")) {
    return "No hay stock suficiente para alguno de los productos.";
  }
  if (message.includes("no price")) {
    return "Un producto ya no tiene precio vigente. Actualizá tu carrito.";
  }
  if (message.includes("active customer")) {
    return "Tu cuenta no está habilitada como cliente activo.";
  }
  return "No pudimos crear el pedido. Probá nuevamente.";
}
