'use client';

import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  RocketLaunchIcon, 
  ChevronRightIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/solid";

export default function ProductsPage() {
  const categories = [
    {
      title: "Recarga Telefónica", // Título ajustado
      desc: "Gestión de saldo instantáneo.",
      href: "/dashboard/products/recarga/telefonica",
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-white" />,
      color: "from-blue-600 to-cyan-500",
      bg: "bg-blue-50",
      status: "Oficial"
    },
    {
      title: "Marketing",
      desc: "Crecimiento social premium.",
      href: "/dashboard/products/marketing",
      icon: <RocketLaunchIcon className="w-6 h-6 text-white" />,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50",
      status: "Activo"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* HEADER COMPACTO */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-1 bg-red-600 rounded-full" />
          <span className="text-red-600 font-black uppercase tracking-widest text-[9px]">
            Catálogo
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Panel de <span className="text-slate-500">Productos</span>
        </h1>
      </div>

      {/* GRID AUTOMÁTICO RESPONSIVO */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={cat.href}
            className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* STATUS MINI */}
            <div className="absolute top-3 right-3 z-10">
              <span className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-600 border border-slate-100 shadow-sm">
                <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-500" />
                {cat.status}
              </span>
            </div>

            {/* ÁREA VISUAL REDUCIDA */}
            <div className={`h-28 flex items-center justify-center ${cat.bg} relative`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {cat.icon}
              </div>
            </div>

            {/* CONTENIDO COMPACTO */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-black text-slate-900 mb-1 group-hover:text-red-600 transition-colors">
                {cat.title}
              </h2>
              <p className="text-slate-500 text-xs font-medium leading-snug mb-4">
                {cat.desc}
              </p>

              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Gestionar
                </span>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-red-600 transition-colors" />
              </div>
            </div>
          </Link>
        ))}

        {/* BOTÓN "AÑADIR" PEQUEÑO */}
        <div className="border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-6 bg-slate-50/30 opacity-60">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Configurar<br/>Nuevo</p>
        </div>
      </div>
    </div>
  );
}

