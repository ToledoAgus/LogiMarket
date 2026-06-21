import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CatalogPage from "@/app/catalogo/page";
import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";
import { SiteHeader } from "@/components/layout/site-header";

describe("páginas públicas iniciales", () => {
  it("renderiza la Home y sus llamados a la acción", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Abastecé tu comercio de forma simple.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver catálogo/i })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(screen.getByRole("link", { name: /ingresar como cliente/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("renderiza el estado vacío del Catálogo sin productos simulados", () => {
    render(<CatalogPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Catálogo mayorista" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no se muestran productos simulados/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver precios/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("renderiza Acceso y comunica que Auth aún no está habilitado", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ingresá a LogiMarket" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/el acceso se habilitará en el Sprint 1/i)).toBeInTheDocument();
  });
});

describe("navegación principal", () => {
  it("expone destinos válidos para inicio, catálogo, promociones y acceso", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "LogiMarket" })).toHaveAttribute("href", "/");

    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(navigation).getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(within(navigation).getByRole("link", { name: "Promociones" })).toHaveAttribute(
      "href",
      "/#promociones",
    );
    expect(within(navigation).getByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
