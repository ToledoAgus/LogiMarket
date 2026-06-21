import { z } from "zod";

const priceKindSchema = z.enum(["unit", "box", "display", "bulk"]);

export const orderItemSchema = z.object({
  priceKind: priceKindSchema,
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  address: z.string().trim().min(4, "Ingresá una dirección de entrega."),
  businessName: z.string().trim().min(2, "Ingresá el nombre del comercio."),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal("")),
  firstName: z.string().trim().min(2, "Ingresá tu nombre."),
  items: z.array(orderItemSchema).min(1, "El carrito está vacío."),
  lastName: z.string().trim().min(1, "Ingresá tu apellido."),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Ingresá un teléfono."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export type PlaceOrderResult =
  | { error: string; ok: false }
  | { ok: true; orderNumber: string; totalCents: number; whatsappUrl: string };
