"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "./actions";
import { Field, SubmitButton } from "./auth-fields";
import type { AuthFormState } from "./schemas";

const initialState: AuthFormState = { error: null };

export function LoginForm({
  justRegistered,
  redirectTo,
}: {
  justRegistered?: boolean;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {justRegistered ? (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          Tu cuenta fue creada. Iniciá sesión para continuar.
        </p>
      ) : null}

      <input name="redirectTo" type="hidden" value={redirectTo ?? "/catalogo"} />
      <Field autoComplete="email" label="Email" name="email" type="email" />
      <Field autoComplete="current-password" label="Contraseña" name="password" type="password" />

      {state.error ? (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Ingresar</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link className="font-semibold text-primary hover:underline" href="/registro">
          Registrate
        </Link>
      </p>
    </form>
  );
}
