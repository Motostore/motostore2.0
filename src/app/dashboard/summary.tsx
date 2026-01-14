'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Configuración API
// NOTA: Esto ya incluye "/api/v1" al final
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

// Roles con acceso
const ROLES_CON_ACCESO = [
  'SUPERUSER', 'ADMIN', 'DISTRIBUTOR', 'RESELLER', 
  'TAQUILLA', 'SUBTAQUILLA', 'SUSTAQUILLA', 'CLIENT'
];

export default function SummaryWidget() {
  const { data: session, status } = useSession();
  
  const [firstLoad, setFirstLoad] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [utilities, setUtilities] = useState<number>(0);

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

        const [userRes, utilRes] = await Promise.all([
          // Ruta correcta para datos del usuario
          fetch(`${API_BASE}/me`, { cache: 'no-store', headers }), 
          
          // 🔥 CORRECCIÓN: Quitamos "/api/v1" porque API_BASE ya lo trae.
          // Antes: .../api/v1/api/v1/reports/utilities (Error 404)
          // Ahora: .../api/v1/reports/utilities (Correcto)
          fetch(`${API_BASE}/reports/utilities`, { cache: 'no-store', headers }),
        ]);

        // --- PROCESAR SALDO (Desde /me) ---
        if (userRes.ok) {
            const userJson = await userRes.json().catch(() => ({}));
            const val = userJson.balance ?? 0;
            setBalance(Number(val));
        }

        // --- PROCESAR UTILIDADES ---
        if (utilRes.ok) {
            const uJson = await utilRes.json().catch(() => ({}));
            const rawVal = uJson.net_system_balance ?? uJson.utilities ?? uJson.total ?? uJson.balance ?? 0;
            setUtilities(Number(rawVal));
        } else {
            console.warn("Utilidades error:", utilRes.status);
        }

      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setFirstLoad(false);
      }
  };

  // Auto-refresco cada 10 seg
  useEffect(() => {
    if (status === 'authenticated') {
      loadData(false);
      const intervalo = setInterval(() => loadData(true), 10000); 
      return () => clearInterval(intervalo);
    }
  }, [status]);

  // Formateador
  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* TARJETA 1: SALDO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
         <div className="absolute top-4 right-4 flex h-2 w-2" title="Actualización en tiempo real">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
         </div>

         <div className="flex flex-col h-full justify-between">
           <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <BanknotesIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Saldo Disponible</span>
              </div>
              <div className="text-3xl lg:text-4xl font-black tracking-tight text-slate-800 mb-1">
                {firstLoad ? <span className="text-slate-200 animate-pulse text-2xl">...</span> : formatMoney(balance)}
              </div>
           </div>
           <p className="text-slate-400 text-xs font-medium pt-4 mt-2 border-t border-slate-50">Billetera Principal</p>
         </div>
      </div>

      {/* TARJETA 2: UTILIDADES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
         <div className="flex flex-col h-full justify-between">
           <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Utilidades</span>
              </div>
              <div className="text-3xl lg:text-4xl font-black tracking-tight text-slate-800 mb-1">
                {firstLoad ? <span className="text-slate-200 animate-pulse text-2xl">...</span> : formatMoney(utilities)}
              </div>
           </div>
           <div className="pt-4 mt-2 border-t border-slate-50">
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
               ACUMULADO
             </span>
           </div>
         </div>
      </div>

      {/* TARJETA 3: ESTADO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
         <div className="flex flex-col h-full justify-between">
           <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg text-[#E33127] group-hover:bg-red-100 transition-colors">
                    <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Nivel de Acceso</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight truncate">
                {role}
              </div>
           </div>
           <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-50"> 
             <span className="text-xs text-slate-400">Estado de cuenta</span>
             <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               ACTIVO
             </span>
           </div>
         </div>
      </div>
    </div>
  );
}