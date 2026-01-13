// src/app/calculadorapaypal/page.tsx (CÓDIGO COMPLETO - NIVEL ULTRA PREMIUM)

import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";
import { ProfileProvider } from "../Context/profileContext";

// Importamos el ecosistema de diseño unificado
import Header from "../ui/header";
import NavigationHome from "../ui/common/NavigationHome"; 
import MarqueeBar from "../ui/common/MarqueeBar";         
import Footer from "../ui/footer";
import { ANUNCIO_BARRA } from "../mensajes";              

export const metadata: Metadata = {
  title: "Calculadora PayPal 2026 | Moto Store LLC",
  description: "Herramienta profesional para calcular comisiones PayPal 2025.",
  keywords: [
    "calculadora PayPal",
    "comisiones 2026",
    "fees paypal",
    "enviar dinero",
    "moto store tools",
  ],
  alternates: {
    canonical: "https://motostorellc.com/CalculadoraPaypal",
  },
  openGraph: {
    title: "Calculadora PayPal 2026 | Moto Store LLC",
    description: "Calcula tus comisiones al instante con nuestra herramienta PRO.",
    url: "https://motostorellc.com/CalculadoraPaypal",
    siteName: "Moto Store LLC",
    images: [
      {
        url: "https://motostorellc.com/og/calculadora-paypal-2025.png",
        width: 1200,
        height: 630,
        alt: "Calculadora PayPal 2025",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora PayPal 2025 | Moto Store LLC",
    images: ["https://motostorellc.com/og/calculadora-paypal-2025.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Page() {
  const BRAND_RED = 'text-[#E33127]';

  return (
    <ProfileProvider>
      <main className="flex flex-col min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
        
        {/* ENCABEZADO Y NAVEGACIÓN */}
        <Header />
        <div className="w-full my-1 border-none outline-none z-40 relative">
          <MarqueeBar text={ANUNCIO_BARRA} styleType="minimal" />
        </div>
        <NavigationHome />

        {/* SECCIÓN PRINCIPAL */}
        <section className="flex-1 relative py-12 md:py-20 flex flex-col items-center justify-start overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-40 pointer-events-none -z-10"></div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
            
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                Calculadora <span className={BRAND_RED}>PayPal 2026</span>
              </h1>
              
              {/* TEXTO EN ULTRA NEGRITA (SOLICITADO) */}
              <p className="text-slate-600 text-lg font-black tracking-wide">
                Calcula tus comisiones exactas para enviar o recibir dinero.
              </p>
            </div>

            {/* CONTENEDOR DE LA CALCULADORA */}
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 p-2 sm:p-6 md:p-8">
              <CalculatorClient />
            </div>

            {/* DISCLAIMER LEGAL EN ULTRA NEGRITA (SOLICITADO) */}
            <p className="mt-8 text-xs text-slate-500 text-center max-w-lg font-black leading-relaxed">
              *Los cálculos son estimados basados en las tarifas estándar de PayPal. 
              Moto Store LLC no se hace responsable por variaciones en las políticas de la plataforma.
            </p>

          </div>
        </section>

        <Footer />

      </main>
    </ProfileProvider>
  );
}


































































































































