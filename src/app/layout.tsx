import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeScript } from "@/components/theme/theme-script";
import { env } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "LogiMarket",
  description: "Catálogo mayorista y pedidos online para tu comercio.",
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: "LogiMarket", template: "%s | LogiMarket" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0057B8" },
    { media: "(prefers-color-scheme: dark)", color: "#07111F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
