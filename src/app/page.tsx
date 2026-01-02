// src/app/page.tsx
import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Moto Store LLC | Soluciones Digitales 24/7",
  description:
    "Plataforma oficial de Moto Store LLC con soluciones digitales, herramientas avanzadas y productos seleccionados para tu negocio.",
  keywords: [
    "Moto Store LLC",
    "soluciones digitales",
    "plataforma online",
    "herramientas digitales",
    "calculadora PayPal",
    "Moto Store",
  ],
  alternates: {
    canonical: "https://motostorellc.com",
  },
  openGraph: {
    title: "Moto Store LLC | Soluciones Digitales 24/7",
    description:
      "Explora la plataforma de Moto Store LLC: herramientas digitales, calculadoras y soluciones profesionales.",
    url: "https://motostorellc.com",
    siteName: "Moto Store LLC",
    images: [
      {
        url: "https://motostorellc.com/og/home-motostore-2025.png",
        width: 1200,
        height: 630,
        alt: "Moto Store LLC - Home",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moto Store LLC | Soluciones Digitales 24/7",
    description:
      "Herramientas y soluciones digitales profesionales de Moto Store LLC para tu negocio.",
    images: ["https://motostorellc.com/og/home-motostore-2025.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function HomePage() {
  // Server component muy ligero: solo envuelve al cliente
  return <HomeClient />;
}


















