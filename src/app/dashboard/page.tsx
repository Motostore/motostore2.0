// src/app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowTrendingUpIcon, 
  BanknotesIcon,
  DevicePhoneMobileIcon, 
  CreditCardIcon, 
  LifebuoyIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  WalletIcon,
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

// Imports locales
import SummaryWidget from "./summary"; 
import SMMBalanceCard from "./SMMBalanceCard"; 

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

// ====================================================================
// 1. VISTA DEL CLIENTE (Diseño Rico pero Corporativo)
// ====================================================================
function ClientDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER CLIENTE - BANNER ROJO (Recuperado para dar peso visual) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E33127] to-[#B91C1C] text-white shadow-xl shadow-red-900/20 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            Hola, {userName} 👋
          </h1>
          <p className="text-red-100 font-medium text-lg max-w-xl">
            Bienvenido a Moto Store. Tu panel está listo para gestionar tus servicios.
          </p>
        </div>
        {/* Decoración sutil de fondo */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
           <SparklesIcon className="w-full h-full text-white" />
        </div>
      </div>

      {/* RESUMEN (En tarjeta elevada) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
         <div className="p-6">
            <SummaryWidget />
         </div>
      </div>

      {/* ACCIONES RÁPIDAS (Más robustas) */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">¿Qué quieres hacer hoy?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <QuickBtn href="/dashboard/products" icon={ShoppingBagIcon} label="Productos" desc="Ver catálogo" />
            <QuickBtn href="/dashboard/reports/payment" icon={CreditCardIcon} label="Reportar Pago" desc="Registrar transferencia" />
            <QuickBtn href="/dashboard/wallet/withdraw" icon={WalletIcon} label="Mi Billetera" desc="Ver saldo y retiros" />
            <QuickBtn href="/dashboard/help" icon={LifebuoyIcon} label="Ayuda" desc="Contactar soporte" />
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// 2. VISTA DEL ADMINISTRADOR (Panel de Control Financiero)
// ====================================================================
function AdminDashboard({ token, role }: { token: string, role: string }) {
  const [data, setData] = useState<{ total_income: number; total_withdrawn: number; net_system_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports/utilities`, {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const isSuper = role === 'SUPERUSER';
  const pageTitle = isSuper ? "PANEL SUPER USER" : "PANEL ADMINISTRATIVO";
  const badgeClass = "bg-white/20 text-white backdrop-blur-sm border border-white/30";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER ROJO CON SOMBRA (Imponente) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-[#E33127] to-[#B91C1C] text-white p-8 rounded-2xl shadow-lg shadow-red-900/20">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black tracking-wider uppercase">{pageTitle}</h1>
           <p className="text-red-100 text-sm mt-1 font-bold tracking-wide opacity-90">
             {isSuper ? "Control Financiero y Operativo Global" : "Gestión de Plataforma"}
           </p>
        </div>
        <div className={`mt-4 sm:mt-0 px-5 py-2 rounded-lg text-xs font-black tracking-widest shadow-lg ${badgeClass}`}>
            {role}
        </div>
      </div>

      {/* MÉTRICAS FINANCIERAS (Diseño Rico con Colores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* 1. SMM Balance (Provider) */}
         <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm h-full hover:shadow-md transition-shadow">
            <div className="h-full p-6">
                <SMMBalanceCard />
            </div>
         </div>

         {/* 2. INGRESOS (Verde Esmeralda) */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-300 transition-all cursor-default">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <ArrowTrendingUpIcon className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos Históricos</span>
             </div>
             <p className="text-4xl font-black text-emerald-800 tracking-tight">
                {loading ? "..." : fmt(data?.total_income || 0)}
             </p>
         </div>

         {/* 3. CAPITAL (Rojo Marca) */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-red-300 transition-all cursor-default">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-xl text-[#E33127]">
                    <BanknotesIcon className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capital Usuarios</span>
             </div>
             <p className="text-4xl font-black text-[#E33127] tracking-tight">
                {loading ? "..." : fmt(data?.net_system_balance || 0)}
             </p>
             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Saldo Líquido en Billeteras</p>
         </div>
      </div>

      {/* HERRAMIENTAS DE GESTIÓN */}
      <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Gestión del Sistema</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <QuickBtn href="/dashboard/users/list" icon={UserGroupIcon} label="Usuarios" desc="Administrar cuentas" />
              <QuickBtn href="/dashboard/payments/approvals" icon={CreditCardIcon} label="Pagos" desc="Aprobar recargas" />
              <QuickBtn href="/dashboard/reports/general" icon={ChartBarIcon} label="Reportes" desc="Métricas globales" />
              <QuickBtn href="/dashboard/settings/commissions" icon={ArrowPathIcon} label="Tasas" desc="Configurar precios" />
          </div>
      </div>
    </div>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading') return null;
  if (!session) return null;

  const role = session.user?.role?.toUpperCase();
  const userName = session.user?.name || "Usuario";
  const token = (session as any)?.accessToken || (session as any)?.user?.token || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
       <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {(role === 'SUPERUSER' || role === 'ADMIN') ? (
             <AdminDashboard token={token} role={role} />
          ) : (
             <ClientDashboard userName={userName} />
          )}
       </div>
    </div>
  );
}

// ====================================================================
// BOTÓN ROBUSTO (Con Descripción)
// ====================================================================
function QuickBtn({ icon: Icon, label, href, desc }: { icon: any, label: string, href: string, desc?: string }) {
  return (
    <Link 
      href={href} 
      className="group relative flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#E33127] hover:shadow-lg hover:shadow-red-900/5 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
         <Icon className="w-20 h-20 text-[#E33127] -mr-6 -mt-6" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="p-3 bg-slate-50 w-fit rounded-xl group-hover:bg-[#E33127] transition-colors duration-300">
            <Icon className="h-6 w-6 text-slate-500 group-hover:text-white transition-colors duration-300" />
        </div>
        <div>
            <span className="block text-sm font-black text-slate-700 group-hover:text-[#E33127] uppercase tracking-wide transition-colors">
                {label}
            </span>
            {desc && (
                <span className="block text-xs text-slate-400 font-medium mt-1">
                    {desc}
                </span>
            )}
        </div>
      </div>
    </Link>
  );
}

















