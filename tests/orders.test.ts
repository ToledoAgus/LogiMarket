import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/features/orders/schemas";
import { buildWhatsappUrl } from "@/features/orders/whatsapp";

describe("mensaje de WhatsApp del pedido", () => {
  const url = buildWhatsappUrl({
    businessName: "Kiosco Demo",
    customerName: "Cliente Demo",
    lines: [
      { priceKind: "unit", productName: "Surtido Bagley", quantity: 3, subtotalCents: 855000 },
      { priceKind: "box", productName: "Chocolina 250 g", quantity: 1, subtotalCents: 1500000 },
    ],
    notes: "Entregar por la mañana",
    orderNumber: "LM-20260620-AB12CD",
    phoneNumber: "+54 9 11 5146-1419",
    totalCents: 2355000,
  });

  const decoded = decodeURIComponent(url.split("text=")[1] ?? "");

  it("apunta a wa.me con solo dígitos del teléfono", () => {
    expect(url.startsWith("https://wa.me/5491151461419?text=")).toBe(true);
  });

  it("incluye número de pedido, productos, cantidades, total y observaciones", () => {
    expect(decoded).toContain("LM-20260620-AB12CD");
    expect(decoded).toContain("3× Surtido Bagley");
    expect(decoded).toContain("Chocolina 250 g");
    expect(decoded).toContain("Total estimado");
    expect(decoded).toContain("Entregar por la mañana");
  });
});

describe("validación de checkout", () => {
  const validItem = { priceKind: "unit" as const, productId: "00000000-0000-4000-8000-000000000301", quantity: 3 };

  it("rechaza un carrito vacío", () => {
    const result = checkoutSchema.safeParse({
      address: "Calle 123",
      businessName: "Kiosco",
      firstName: "Ana",
      items: [],
      lastName: "Pérez",
      phone: "1151461419",
    });
    expect(result.success).toBe(false);
  });

  it("acepta un pedido válido con email opcional vacío", () => {
    const result = checkoutSchema.safeParse({
      address: "Calle 123",
      businessName: "Kiosco",
      email: "",
      firstName: "Ana",
      items: [validItem],
      lastName: "Pérez",
      phone: "1151461419",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza cantidades no positivas", () => {
    const result = checkoutSchema.safeParse({
      address: "Calle 123",
      businessName: "Kiosco",
      firstName: "Ana",
      items: [{ ...validItem, quantity: 0 }],
      lastName: "Pérez",
      phone: "1151461419",
    });
    expect(result.success).toBe(false);
  });
});
