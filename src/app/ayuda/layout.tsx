// src/app/ayuda/layout.tsx (EDICIÓN PRO ORO +++ / ESTRUCTURA UNIFICADA)

import type { Metadata } from 'next'; 
import './accordion.css'; // Estilos necesarios para el acordeón de preguntas

// 1. IMPORTAMOS EL ECOSISTEMA PRO (El mismo del Home)
import Header from '../ui/header';
import NavigationHome from '../ui/common/NavigationHome'; // Usamos la navegación nueva (Píldoras)
import MarqueeBar from '../ui/common/MarqueeBar';         // Barra de anuncios limpia
import Footer from '../ui/footer';
import { ANUNCIO_BARRA } from '../mensajes';              // Texto centralizado

// 2. SEO ULTRA OPTIMIZADO
export const metadata: Metadata = {
  title: "Centro de Ayuda y Soporte | Moto Store LLC",
  description:
    "Resuelve tus dudas sobre métodos de pago, recargas y servicios digitales. Soporte 24/7 actualizado.",
  keywords: [
    "ayuda moto store",
    "soporte técnico",
    "preguntas frecuentes",
    "cómo funciona",
    "tutoriales",
  ],
  alternates: {
    canonical: "https://motostorellc.com/ayuda",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  
  return (
    // CAMBIO: 'bg-white' para el diseño Clean Canvas (sin gris de fondo)
    <div className="flex min-h-screen flex-col font-sans text-slate-900 bg-white">
      
      {/* ==================== ZONA SUPERIOR (NIVEL PRO) ==================== */}
      
      {/* 1. HEADER (Logo + Fecha) */}
      <Header />

      {/* 2. BARRA DE ANUNCIOS (Limpia y conectada a mensajes.ts) */}
      <div className="w-full my-1 border-none outline-none z-40 relative">
        <MarqueeBar text={ANUNCIO_BARRA} styleType="minimal" />
      </div>

      {/* 3. NAVEGACIÓN (Menú Píldora) */}
      <NavigationHome />

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      {/* Usamos flex-grow para que ocupe todo el espacio disponible antes del footer */}
      <main className="flex-grow w-full">
        
        {/* Contenedor centrado y alineado con el resto de la web (max-w-7xl) */}
        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-16 max-w-7xl animate-fade-in">
          {children}
        </div>

      </main>

      {/* ==================== FOOTER ==================== */}
      <Footer />
      
    </div>
  );
}