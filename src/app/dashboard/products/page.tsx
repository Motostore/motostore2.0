'use client';

import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  RocketLaunchIcon, 
  ChevronRightIcon, 
  ShieldCheckIcon,
  ShoppingCartIcon, // Nuevo icono para la Tienda
  PlayCircleIcon
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
      status: "Oficial",
      actionText: "Gestionar"
    },
    {
      title: "Marketing",
      desc: "Crecimiento social premium.",
      href: "/dashboard/products/marketing",
      icon: <RocketLaunchIcon className="w-6 h-6 text-white" />,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50",
      status: "Activo",
      actionText: "Gestionar"
    },
    // 🔥 CAMBIO CLAVE: Streaming ahora apunta a la TIENDA OFICIAL
    {
      title: "Streaming",
      desc: "Netflix, Disney+, Max y más.",
      href: "/dashboard/store", // <--- Redirige a la Tienda Automática
      icon: <ShoppingCartIcon className="w-6 h-6 text-white" />, // Icono de compra
      color: "from-violet-600 to-fuchsia-600",
      bg: "bg-violet-50",
      status: "Venta Auto", // Etiqueta actualizada
      actionText: "Ir a la Tienda" // Texto claro para el usuario
    },
    {
      title: "Licencias Software",
      desc: "Windows, Office, Antivirus.",
      href: "/dashboard/products/licenses",
      icon: <ShieldCheckIcon className="w-6 h-6 text-white" />,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      status: "Nuevo",
      actionText: "Gestionar"
    }
  ];

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* HEADER COMPACTO */}
      <div className="max-w-6xl mx-auto mb-6 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-1 bg-[#E33127] rounded-full" />
          <span className="text-[#E33127] font-black uppercase tracking-widest text-[9px]">
            Directorio
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Panel de <span className="text-slate-500">Servicios</span>
        </h1>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={cat.href}
            className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* STATUS MINI */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-sm ${cat.title === 'Streaming' ? 'text-[#E33127] border-red-100' : 'text-slate-600 border-slate-100'}`}>
                {cat.title === 'Streaming' ? <ShoppingCartIcon className="w-2.5 h-2.5"/> : <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-500" />}
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

            {/* CONTENIDO */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-black text-slate-900 mb-1 group-hover:text-[#E33127] transition-colors">
                {cat.title}
              </h2>
              <p className="text-slate-500 text-xs font-medium leading-snug mb-4">
                {cat.desc}
              </p>

              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${cat.title === 'Streaming' ? 'text-[#E33127]' : 'text-slate-400'}`}>
                  {cat.actionText || "Gestionar"}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-[#E33127] transition-colors" />
              </div>
            </div>
          </Link>
        ))}

        {/* BOTÓN "CONFIGURAR" (Solo visual) */}
        <div className="border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-6 bg-slate-50/30 opacity-60 hover:opacity-100 transition-all cursor-pointer hover:border-red-200 group min-h-[200px] sm:min-h-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:text-[#E33127] transition-colors">
              Próximamente<br/>Más Servicios
            </p>
        </div>
      </div>
    </div>
  );
}