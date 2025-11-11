// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";

import TopNav from "../ui/dashboard/topnav";            // <-- SIN guion
import BrandHeader from "../ui/dashboard/brand-header";
import AnnouncementBar from "../ui/dashboard/announcement-bar";

export const metadata = {
  title: "Panel | Moto Store LLC",
  description: "Panel de administración de Motostore",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* 1) Marca (logo + nombre + panel derecho) */}
      <div className="bg-white border-b">
        <BrandHeader />
      </div>

      {/* 2) Barra informativa */}
      <AnnouncementBar />

      {/* 3) Menú superior */}
      <TopNav />

      {/* 4) Contenido */}
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
}








