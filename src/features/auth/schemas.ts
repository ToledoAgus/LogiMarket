import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const registerSchema = z.object({
  businessName: z.string().trim().min(2, "El nombre del comercio es obligatorio."),
  email: z.string().trim().email("Ingresá un email válido."),
  ownerName: z.string().trim().min(2, "El nombre del titular es obligatorio."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  phone: z.string().trim().min(6, "Ingresá un teléfono de contacto."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthFormState = {
  error: string | null;
};
