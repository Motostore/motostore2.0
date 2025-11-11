// src/app/layout.tsx
import "./ui/globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Moto Store LLC | Soluciones Digitales 24/7",
    template: "%s | Moto Store LLC",
  },
  description: "Plataforma Moto Store LLC",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  icons: {},
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className="
          min-h-[100dvh] bg-slate-50 text-slate-900
          antialiased overflow-x-hidden touch-manipulation
          selection:bg-slate-200 selection:text-slate-900
        "
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <Providers>
          <div className="isolate flex min-h-[100dvh] flex-col">
            {children}
          </div>

          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}





































