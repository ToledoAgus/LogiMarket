"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "auto";

const themeDetails: Record<Theme, { label: string; icon: typeof Sun }> = {
  light: { label: "Tema claro", icon: Sun },
  dark: { label: "Tema oscuro", icon: Moon },
  auto: { label: "Tema automático", icon: Laptop },
};

function applyTheme(theme: Theme) {
  const hour = new Date().getHours();
  const resolved = theme === "auto" ? (hour >= 7 && hour < 19 ? "light" : "dark") : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    const stored = localStorage.getItem("logimarket-theme") as Theme | null;
    const initial = stored && stored in themeDetails ? stored : "auto";
    setTheme(initial);
    applyTheme(initial);

    const timer = window.setInterval(() => {
      if (initial === "auto") applyTheme("auto");
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const active = themeDetails[theme];
  const Icon = active.icon;

  function cycleTheme() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "auto" : "light";
    setTheme(next);
    localStorage.setItem("logimarket-theme", next);
    applyTheme(next);
  }

  return (
    <Button
      aria-label={`${active.label}. Cambiar tema`}
      onClick={cycleTheme}
      size="icon"
      title={`${active.label}. Presioná para cambiar.`}
      variant="ghost"
    >
      <Icon aria-hidden="true" className="size-5" />
    </Button>
  );
}
