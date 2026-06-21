"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function Field({
  autoComplete,
  defaultValue,
  label,
  name,
  placeholder,
  type = "text",
}: {
  autoComplete?: string;
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      <input
        autoComplete={autoComplete}
        className="mt-1.5 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending} size="lg" type="submit">
      {pending ? "Procesando…" : children}
    </Button>
  );
}
