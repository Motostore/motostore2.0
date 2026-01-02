// src/app/layout.tsx (EDICIÓN FINAL: ULTRA PREMIUM MAESTRO)

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

// Estilos Globales
import "./ui/globals.css";

// 1. INTEGRACIÓN DE FONT AWESOME (Iconos)
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; 

// 2. INTEGRACIÓN DE ANALYTICS (Vercel)
import { Analytics } from '@vercel/analytics/react'; 

// 3. PROVEEDOR DE SESIÓN (Auth)
import { AuthProvider } from "./providers"; 

// Fuente optimizada por Google
const inter = Inter({ subsets: ["latin"] });

// 🚀 VIEWPORT PRO: Configuración técnica para móviles
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff', // La barra del navegador en iPhone/Android será blanca
};

// 🏆 METADATA MAESTRA (SEO GLOBAL)
export const metadata: Metadata = {
  metadataBase: new URL('https://motostorellc.com'), // URL base para resolver imágenes OG
  title: {
    template: '%s | Moto Store LLC', 
    default: 'Moto Store LLC | Soluciones Digitales 24/7',
  },
  description: "Plataforma líder en servicios digitales, recargas móviles internacionales y licencias de software seguras.",
  keywords: ["recargas venezuela", "starlink", "netflix", "servicios digitales", "moto store"],
  authors: [{ name: "Moto Store LLC Team" }],
  icons: {
    icon: '/favicon.ico', // Asegúrate de tener este archivo
  },
  openGraph: {
    title: 'Moto Store LLC',
    description: 'Soluciones Digitales Rápidas y Seguras.',
    url: 'https://motostorellc.com',
    siteName: 'Moto Store LLC',
    locale: 'es_ES',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 'scroll-smooth': Desplazamiento elegante
    <html lang="es" className="scroll-smooth">
      <body 
        className={`
          ${inter.className} 
          antialiased 
          bg-white text-slate-900 
          selection:bg-[#E33127] selection:text-white
        `}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* Analytics se ejecuta silenciosamente */}
        <Analytics /> 
        
      </body>
    </html>
  );
}







































