import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

// Estilos Globales
import "./ui/globals.css";

// 1. INTEGRACIÓN DE FONT AWESOME (Iconos) - ¡MANTENER!
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; 

// 2. INTEGRACIÓN DE ANALYTICS (Vercel) - ¡MANTENER!
import { Analytics } from '@vercel/analytics/react'; 

// 3. PROVEEDOR DE SESIÓN (Auth) - ¡MANTENER!
import { AuthProvider } from "./providers"; 

// Fuente optimizada por Google
const inter = Inter({ subsets: ["latin"] });

// 🚀 VIEWPORT PRO: Configuración técnica para móviles (MODO APP)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita zoom accidental (sensación App Nativa)
  themeColor: '#E33127', // Barra de estado ROJA (Tu marca)
};

// 🏆 METADATA MAESTRA (SEO GLOBAL + REDES SOCIALES)
export const metadata: Metadata = {
  metadataBase: new URL('https://motostorellc.com'), 
  
  title: {
    template: '%s | Moto Store LLC', 
    default: 'Moto Store LLC | Soluciones Digitales y Recargas',
  },
  
  description: "Plataforma líder en Venezuela para recargas automáticas (Zelle, Binance), licencias de software y servicios de streaming. Seguridad garantizada.",
  
  keywords: ["recargas venezuela", "zelle", "binance", "usdt", "netflix", "spotify", "moto store", "pago movil"],
  
  authors: [{ name: "Moto Store LLC Team" }],
  
  // Configuración para iPhone (PWA)
  appleWebApp: {
    capable: true,
    title: "Moto Store",
    statusBarStyle: "default",
  },
  
  icons: {
    icon: '/favicon.ico', 
    apple: '/icon-192.png', // Icono app iPhone
  },
  
  // 📸 CÓMO SE VE AL COMPARTIR (WhatsApp, Facebook) - ¡NUEVO!
  openGraph: {
    title: 'Moto Store LLC | Tu Solución Digital',
    description: 'Recargas Zelle/Binance y Servicios Streaming al instante.',
    url: 'https://motostorellc.com',
    siteName: 'Moto Store LLC',
    locale: 'es_VE',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // 🔥 RECUERDA SUBIR ESTA IMAGEN A LA CARPETA PUBLIC
        width: 1200,
        height: 630,
        alt: 'Moto Store LLC Banner Oficial',
      },
    ],
  },

  // 🐦 TARJETA DE TWITTER (X) - ¡NUEVO!
  twitter: {
    card: 'summary_large_image',
    title: 'Moto Store LLC',
    description: 'Plataforma líder en servicios digitales y recargas.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        {/* Envolvemos la App con la Sesión (Login) */}
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* Analytics corre en segundo plano */}
        <Analytics /> 
        
      </body>
    </html>
  );
}







































