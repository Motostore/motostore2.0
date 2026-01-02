import type { ReactNode } from "react";
import type { Metadata } from "next";

// CORRECCIÓN: Usamos rutas absolutas con '@' para evitar errores de "Module not found"
import TopNav from "@/app/ui/dashboard/topnav";
import BrandHeader from "@/app/ui/dashboard/brand-header";
import NoticeChips from "@/app/ui/dashboard/notice-chips";

export const metadata: Metadata = {
  title: "Panel",
  description: "Panel de administración de Motostore",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // ESTRUCTURA: Columna vertical (flex-col). Sin flex-row, sin sidebar al lado.
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* BLOQUE SUPERIOR FIJO (STICKY) */}
      <header className="sticky top-0 z-50 w-full shadow-md bg-white flex flex-col">

        {/* 1. Cabecera de Marca (Logo y Usuario) */}
        <div className="w-full bg-white border-b border-slate-200">
          {/* Centrado idéntico al del contenido principal */}
          <div className="mx-auto w-full max-w-7xl px-4">
            <BrandHeader />
          </div>
        </div>

        {/* 2. Avisos (Chips) */}
        <NoticeChips />

        {/* 3. Menú Rojo (TopNav) */}
        {/* Renderizamos el componente. Él se encargará de su propio color y centrado. */}
        <TopNav />
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          {children}
        </div>
      </main>

    </div>
  );
}




