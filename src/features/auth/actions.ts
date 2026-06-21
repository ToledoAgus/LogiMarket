"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { loginSchema, registerSchema, type AuthFormState } from "./schemas";

function safeRedirectPath(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  // Solo rutas internas; evita open redirects.
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/catalogo";
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirectPath(formData.get("redirectTo")) as Route);
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    ownerName: formData.get("ownerName"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    options: {
      data: { first_name: parsed.data.ownerName },
    },
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        error.message === "User already registered"
          ? "Ya existe una cuenta con ese email. Iniciá sesión."
          : "No pudimos crear la cuenta. Probá nuevamente.",
    };
  }

  // Con confirmación por email desactivada (local) hay sesión inmediata y se
  // crea la ficha de cliente. Con confirmación activa (producción) la ficha se
  // crea de forma idempotente en el primer inicio de sesión.
  if (data.session) {
    const { error: customerError } = await supabase.rpc("register_customer", {
      p_business_name: parsed.data.businessName,
      p_owner_name: parsed.data.ownerName,
      p_phone: parsed.data.phone,
    });

    if (customerError) {
      return { error: "Tu cuenta se creó, pero falló el alta comercial. Contactanos." };
    }

    revalidatePath("/", "layout");
    redirect("/catalogo");
  }

  redirect("/login?registered=1");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
