import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react'; 

// Estilos Globales
import "./ui/globals.css";

// 1. INTEGRACIÓN DE FONT AWESOME
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; 

// 2. PROVEEDOR DE SESIÓN
import { AuthProvider } from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

// 🚀 VIEWPORT
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, 
  themeColor: '#ffffff', 
};

// 🏆 METADATA MAESTRA
export const metadata: Metadata = {
  metadataBase: new URL('https://motostorellc.com'),
  
  title: {
    template: '%s | Moto Store LLC', 
    default: 'Moto Store LLC | Remesas, Streaming y Desarrollo Web', 
  },
  
  description: "Plataforma global de servicios digitales: Remesas P2P, Cambio de Saldo (PayPal/Zelle), Streaming Premium y Desarrollo de Software.",
  
  keywords: [
    "Moto Store LLC", 
    "Remesas Venezuela", 
    "Desarrollo Web", 
    "Marketing Digital", 
    "PayPal", 
    "Streaming"
  ],
  
  authors: [{ name: "Moto Store Team", url: "https://motostorellc.com" }],
  
  // 🔥 AQUÍ ESTABA EL ERROR: CAMBIADO A TU LOGO REAL
  icons: {
    icon: '/motostore-logo.png',      
    shortcut: '/motostore-logo.png',  
    apple: '/motostore-logo.png', 
  },
  
  openGraph: {
    title: 'Moto Store LLC',
    description: 'Soluciones Digitales: Remesas, Web y Streaming.',
    url: 'https://motostorellc.com',
    siteName: 'Moto Store LLC',
    locale: 'es_LA', 
    type: 'website',
    images: [
      {
        url: '/motostore-logo.png', // También aseguramos esto por si no tienes la imagen OG aún
        width: 1200,
        height: 630,
        alt: 'Moto Store LLC Oficial',
      },
    ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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

        <Analytics /> 
        
      </body>
    </html>
  );
}






































