// src/app/dashboard/summary.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

// Configuración API
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

// Roles
const ROLES_CON_ACCESO = [
  'SUPERUSER', 'ADMIN', 'DISTRIBUTOR', 'RESELLER', 
  'TAQUILLA', 'SUBTAQUILLA', 'SUSTAQUILLA', 'CLIENT'
];

export default function SummaryWidget() {
  const { data: session, status } = useSession();
  
  const [firstLoad, setFirstLoad] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [utilities, setUtilities] = useState<number>(0); // Iniciamos en 0 para que no salga --

  // Obtener token y rol de forma segura
  const token = (session as any)?.accessToken || (session as any)?.user?.accessToken || (session as any)?.user?.token || null;
  const role = (session as any)?.user?.role?.toUpperCase() || 'CLIENT';
  const puedeVer = useMemo(() => ROLES_CON_ACCESO.includes(role), [role]);

  const loadData = async (silent = false) => {
      if (status === 'loading') return;
      if (!silent) setFirstLoad(true);

      if (!puedeVer || !token) { 
        setFirstLoad(false); 
        return; 
      }

      try {
        const headers: HeadersInit = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [bRes, uRes] = await Promise.all([
          fetch(`${API_BASE}/wallet/me`, { cache: 'no-store', headers }),
          fetch(`${API_BASE}/reports/utilities`, { cache: 'no-store', headers }),
        ]);

        // --- PROCESAR SALDO ---
        if (bRes.ok) {
            const bJson = await bRes.json().catch(() => ({}));
            // Aceptamos el valor si es número o string numérico
            const val = bJson.balance ?? 0;
            setBalance(Number(val));
        }

        // --- PROCESAR UTILIDADES (CORREGIDO) ---
        if (uRes.ok) {
            const uJson = await uRes.json().catch(() => ({}));
            // Buscamos el valor en varias llaves posibles por seguridad
            const rawVal = uJson.net_system_balance ?? uJson.utilities ?? uJson.total ?? uJson.balance ?? 0;
            setUtilities(Number(rawVal));
        } else {
            // Si falla (ej. 404), ponemos 0 en lugar de null
            console.warn("No se pudieron cargar utilidades:", uRes.status);
            // No reseteamos a 0 si ya había un dato, para evitar parpadeo
        }

      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setFirstLoad(false);
      }
  };

  // Auto-refresco cada 5 seg
  useEffect(() => {
    if (status === 'authenticated') {
      loadData(false);
      const intervalo = setInterval(() => loadData(true), 5000);
      return () => clearInterval(intervalo);
    }
  }, [status]);

  // Formateador seguro
  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* TARJETA 1: SALDO */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-full relative overflow-hidden">
         {/* Indicador 'En Vivo' */}
         <div className="absolute top-4 right-4 flex h-3 w-3" title="Actualización en tiempo real">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
         </div>

         <div className="flex flex-col">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-red-50 rounded-lg text-[#E33127]"><BanknotesIcon className="w-6 h-6" /></div>
             <span className="font-bold text-slate-500 text-sm tracking-wide uppercase">Saldo Disponible</span>
           </div>
           <div className="text-4xl font-black tracking-tight text-[#E33127] mb-2 transition-all">
             {firstLoad ? <span className="animate-pulse opacity-50 text-2xl">Cargando...</span> : formatMoney(balance)}
           </div>
         </div>
         <p className="text-slate-500 text-sm font-medium pt-2 border-t border-slate-100">Billetera Principal</p>
      </div>

      {/* TARJETA 2: UTILIDADES (CORREGIDA) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-full">
         <div className="flex flex-col">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-green-100 rounded-lg text-emerald-600"><ArrowTrendingUpIcon className="w-6 h-6" /></div>
             <span className="font-bold text-slate-500 text-sm tracking-wide uppercase">Utilidades</span>
           </div>
           <div className="text-4xl font-black tracking-tight text-slate-800 mb-2">
             {/* Si carga, muestra 0.00 en vez de -- */}
             {firstLoad ? <span className="animate-pulse opacity-50 text-2xl">Cargando...</span> : formatMoney(utilities)}
           </div>
         </div>
         <p className="text-emerald-600 text-sm font-bold bg-green-50 inline-block px-2 py-0.5 rounded-full pt-2 border-t border-slate-100">
           Acumulado
         </p>
      </div>

      {/* TARJETA 3: ESTADO */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-full">
           <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-lg text-[#E33127]"><ShieldCheckIcon className="w-6 h-6" /></div>
                <span className="font-bold text-slate-500 text-sm tracking-wide uppercase">Nivel de Acceso</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight truncate mb-4">
                {role}
              </div>
           </div>
           <div className="flex justify-between items-center pt-2 border-t border-slate-100"> 
             <span className="text-sm text-slate-500">Estado</span>
             <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
               <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
               ACTIVO
             </span>
           </div>
      </div>
    </div>
  );
}