'use client';

import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  RocketLaunchIcon, 
  ChevronRightIcon, 
  ShieldCheckIcon,
  PlayCircleIcon // Agregado por si prefieres usar un icono nativo en vez del SVG
} from "@heroicons/react/24/solid";

export default function ProductsPage() {
  const categories = [
    {
      title: "Recarga Telefónica",
      desc: "Gestión de saldo instantáneo.",
      href: "/dashboard/products/recarga/telefonica", // ✅ Ruta correcta
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-white" />,
      color: "from-blue-600 to-cyan-500",
      bg: "bg-blue-50",
      status: "Oficial"
    },
    {
      title: "Marketing",
      desc: "Crecimiento social premium.",
      href: "/dashboard/products/marketing", // ✅ Ruta correcta
      icon: <RocketLaunchIcon className="w-6 h-6 text-white" />,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50",
      status: "Activo"
    },
    {
      title: "Streaming",
      desc: "Netflix, Disney+, Max y más.",
      // 🔥 CORRECCIÓN: Apuntamos a la gestión, no a la tienda
      // Si quieres que vaya a la tienda, cambia esto a "/dashboard/store"
      href: "/dashboard/products/streaming", 
      icon: (
        // SVG Personalizado (Mantenido como pediste)
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3l14 9-14 9V3z" fill="currentColor" stroke="none" />
          <path d="M19 12a9 9 0 0 1-2.5 6.5" stroke="currentColor" strokeWidth={2.5} opacity="0.7"/>
          <path d="M22 12a12 12 0 0 1-3.5 9" stroke="currentColor" strokeWidth={2.5} opacity="0.4"/>
        </svg>
      ),
      color: "from-violet-600 to-fuchsia-600",
      bg: "bg-violet-50",
      status: "Gestión" // Cambiado de 'Tienda' a 'Gestión' para ser coherente
    },
    {
      title: "Licencias Software",
      desc: "Windows, Office, Antivirus.",
      href: "/dashboard/products/licenses", // ✅ Ruta correcta
      icon: <ShieldCheckIcon className="w-6 h-6 text-white" />,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      status: "Nuevo"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-1 bg-[#E33127] rounded-full" />
          <span className="text-[#E33127] font-black uppercase tracking-widest text-[10px]">
            Catálogo
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Panel de <span className="text-slate-500">Productos</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Selecciona una categoría para gestionar inventario, precios y disponibilidad.
        </p>
      </div>

      {/* GRID DE CATEGORÍAS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={cat.href}
            prefetch={false} // Evita caché agresivo en navegación
            className="group relative bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* STATUS MINI */}
            <div className="absolute top-4 right-4 z-10">
              <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-100 shadow-sm">
                <ShieldCheckIcon className="w-3 h-3 text-emerald-500" />
                {cat.status}
              </span>
            </div>

            {/* ÁREA VISUAL (GRADIENTE) */}
            <div className={`h-32 flex items-center justify-center ${cat.bg} relative overflow-hidden`}>
              {/* Efecto de fondo animado */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 relative z-10`}>
                {cat.icon}
              </div>
            </div>

            {/* CONTENIDO TEXTO */}
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#E33127] transition-colors">
                {cat.title}
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                {cat.desc}
              </p>

              {/* FOOTER DE LA TARJETA */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                  Gestionar
                </span>
                <div className="p-1.5 rounded-full bg-slate-50 group-hover:bg-red-50 transition-colors">
                   <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-[#E33127] transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* TARJETA: PRÓXIMAMENTE (Placeholder) */}
        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center p-6 bg-slate-50/50 opacity-60 hover:opacity-100 transition-all cursor-pointer hover:border-[#E33127]/30 group min-h-[250px] sm:min-h-0">
            <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-50 transition-colors">
                    <RocketLaunchIcon className="w-5 h-5 text-slate-400 group-hover:text-[#E33127]"/>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#E33127] transition-colors">
                  Próximamente
                </p>
                <p className="text-xs text-slate-400 mt-1">Más servicios</p>
            </div>
        </div>
      </div>
    </div>
  );
}