import { priceKindLabels, type PriceKind } from "@/features/catalog/price-format";
import { formatCents } from "@/lib/money";

export type WhatsappOrderLine = {
  priceKind: PriceKind;
  productName: string;
  quantity: number;
  subtotalCents: number;
};

export type WhatsappOrder = {
  businessName: string;
  customerName: string;
  lines: WhatsappOrderLine[];
  notes: string | null;
  orderNumber: string;
  phoneNumber: string;
  totalCents: number;
};

/**
 * Construye el enlace `wa.me` con el resumen del pedido. El pedido ya está
 * persistido antes de generar el enlace: WhatsApp es notificación, no la
 * fuente de verdad (riesgo "WhatsApp no confirma entrega").
 */
export function buildWhatsappUrl(order: WhatsappOrder): string {
  const digits = order.phoneNumber.replace(/\D/g, "");
  const lines = [
    `*Nuevo pedido ${order.orderNumber}*`,
    `Comercio: ${order.businessName}`,
    `Cliente: ${order.customerName}`,
    "",
    "*Productos:*",
    ...order.lines.map(
      (line) =>
        `• ${line.quantity}× ${line.productName} (${priceKindLabels[line.priceKind]}) — ${formatCents(line.subtotalCents)}`,
    ),
    "",
    `*Total estimado: ${formatCents(order.totalCents)}*`,
  ];

  if (order.notes) {
    lines.push("", `Observaciones: ${order.notes}`);
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}
