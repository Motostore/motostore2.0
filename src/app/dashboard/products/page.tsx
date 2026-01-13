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
      title: "Recarga Telefónica",
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
    },
    {
      title: "Streaming",
      desc: "Netflix, Disney+, Max y más.",
      href: "/dashboard/products/streaming",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3l14 9-14 9V3z" fill="currentColor" stroke="none" />
          <path d="M19 12a9 9 0 0 1-2.5 6.5" stroke="currentColor" strokeWidth={2.5} opacity="0.7"/>
          <path d="M22 12a12 12 0 0 1-3.5 9" stroke="currentColor" strokeWidth={2.5} opacity="0.4"/>
        </svg>
      ),
      color: "from-violet-600 to-fuchsia-600",
      bg: "bg-violet-50",
      status: "Nuevo"
    },
    // 🔥 NUEVO: Licencias de Software (Ahora visible aquí)
    {
      title: "Licencias Software",
      desc: "Windows, Office, Antivirus.",
      href: "/dashboard/products/licenses", // Ruta corregida
      icon: (
        <ShieldCheckIcon className="w-6 h-6 text-white" />
      ),
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      status: "Nuevo"
    }
  ];

  return (
    // FIX 1: Quitamos 'min-h-screen' y el padding superior excesivo.
    // Usamos 'w-full' para asegurar ancho completo.
    <div className="w-full">
      
      {/* HEADER COMPACTO */}
      {/* FIX 2: Redujimos el margen inferior (mb-6 en vez de mb-8) para acercar el título a las tarjetas */}
      <div className="max-w-6xl mx-auto mb-6 mt-2">
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
              <span className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-600 border border-slate-100 shadow-sm">
                <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-500" />
                {cat.status}
              </span>
            </div>

            {/* ÁREA VISUAL */}
            <div className={`h-28 flex items-center justify-center ${cat.bg} relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 relative z-10`}>
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
        <div className="border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-6 bg-slate-50/30 opacity-60 hover:opacity-100 transition-all cursor-pointer hover:border-red-200 group min-h-[200px] sm:min-h-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:text-red-500 transition-colors">
              Configurar<br/>Nuevo
            </p>
        </div>
      </div>
    </div>
  );
}

