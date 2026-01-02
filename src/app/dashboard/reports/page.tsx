"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ChartBarIcon, 
  FunnelIcon, 
  DocumentChartBarIcon, 
  ArrowsRightLeftIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function ReportsIndexPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans animate-in fade-in duration-500">
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100">
              <ChartBarIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Reportes
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Resumen ejecutivo y métricas clave de Moto Store.
              </p>
            </div>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            
            {/* Input Desde */}
            <div className="relative group w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
              </div>
              <input
                type="date"
                className="block w-full sm:w-40 pl-9 pr-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-[#E33127] outline-none transition-all placeholder-slate-400"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Desde"
              />
            </div>

            <span className="text-slate-300 hidden sm:block">/</span>

            {/* Input Hasta */}
            <div className="relative group w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
              </div>
              <input
                type="date"
                className="block w-full sm:w-40 pl-9 pr-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-[#E33127] outline-none transition-all"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* Botón Aplicar */}
            <button
              onClick={() => alert(`Filtro Aplicado:\n📅 ${from || 'Inicio'} — ${to || 'Hoy'}`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E33127] hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-red-200 transition-all active:scale-95"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
          </div>
        </header>

        {/* --- GRID DE ACCESOS DIRECTOS --- */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <CardLink
            title="General"
            desc="Visión global de ventas, ingresos y métricas principales."
            href="/dashboard/reports/general"
            icon={DocumentChartBarIcon}
            color="blue"
          />
          
          <CardLink
            title="Movimientos"
            desc="Auditoría detallada de transacciones diarias."
            href="/dashboard/reports/movimiento"
            icon={ArrowsRightLeftIcon}
            color="emerald"
          />
          
          <CardLink
            title="Utilidades"
            desc="Análisis de rentabilidad por producto y usuario."
            href="/dashboard/reports/utilidades"
            icon={CurrencyDollarIcon}
            color="amber"
          />

        </section>
      </div>
    </div>
  );
}

// --- COMPONENTE DE TARJETA MEJORADO ---
function CardLink({ title, desc, href, icon: Icon, color }: any) {
  // Mapeo de colores para los iconos
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    amber: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
  };

  const activeColor = colors[color] || colors.blue;

  return (
    <Link
      href={href}
      className="group block relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl border transition-colors duration-300 ${activeColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="p-2 rounded-full bg-slate-50 group-hover:bg-[#E33127] transition-colors duration-300">
           <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all duration-300" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#E33127] transition-colors mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}
