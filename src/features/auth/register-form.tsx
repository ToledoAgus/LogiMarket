"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "./actions";
import { Field, SubmitButton } from "./auth-fields";
import type { AuthFormState } from "./schemas";

const initialState: AuthFormState = { error: null };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field autoComplete="organization" label="Nombre del comercio" name="businessName" />
      <Field autoComplete="name" label="Titular" name="ownerName" />
      <Field autoComplete="tel" label="Teléfono" name="phone" type="tel" />
      <Field autoComplete="email" label="Email" name="email" type="email" />
      <Field autoComplete="new-password" label="Contraseña" name="password" type="password" />

      {state.error ? (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Crear cuenta</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link className="font-semibold text-primary hover:underline" href="/login">
          Ingresá
        </Link>
      </p>
    </form>
  );
}
