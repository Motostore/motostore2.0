import type { ReactNode } from "react";
import type { Metadata } from "next";

// Importación de componentes de UI
import TopNav from "@/app/ui/dashboard/topnav";
import BrandHeader from "@/app/ui/dashboard/brand-header";
import NoticeChips from "@/app/ui/dashboard/notice-chips";

export const metadata: Metadata = {
  title: "Panel Motostore",
  description: "Panel de administración",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* BLOQUE SUPERIOR FIJO (STICKY) */}
      {/* Mantiene unida la trinidad: Header Blanco + Avisos + Menú Rojo */}
      <header className="sticky top-0 z-50 w-full shadow-lg flex flex-col bg-white">

        {/* 1. BRAND HEADER (LOGO Y SALDO) */}
        {/* Ocupa 100% de ancho y centra su contenido internamente */}
        <BrandHeader />

        {/* 2. AVISOS (CHIPS) */}
        {/* 🔥 CORREGIDO: Se coloca directo. 
            Ya eliminamos los divs envolventes porque NoticeChips.tsx ahora 
            maneja su propio contenedor 'max-w-7xl' internamente. */}
        <NoticeChips />

        {/* 3. MENÚ ROJO (TOPNAV) */}
        {/* Ocupa 100% de ancho y centra su contenido internamente */}
        <TopNav />
        
      </header>

      {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
      <main className="flex-1 w-full animate-fadeIn">
        {/* Contenedor central alineado perfectamente con el Header y el Menú */}
        {/* Usamos las mismas clases: max-w-7xl px-4 sm:px-6 lg:px-8 */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

    </div>
  );
}




