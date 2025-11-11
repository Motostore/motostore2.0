// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";

import TopNav from "../ui/dashboard/topnav";
import BrandHeader from "../ui/dashboard/brand-header";
import NoticeChips from "../ui/dashboard/notice-chips";

export const metadata: Metadata = {
  title: "Panel",
  description: "Panel de administración de Motostore",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <div className="bg-white border-b">
        <BrandHeader />
      </div>

      <NoticeChips />

      <TopNav />

      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
}























