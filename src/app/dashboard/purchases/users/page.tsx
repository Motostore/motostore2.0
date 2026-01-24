"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

/* ================= TIPOS ================= */
type Transaction = {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  note?: string;
  created_at: string;
  status?: string;
};

/* ================= COMPONENTE PRINCIPAL ================= */
export default function AdminPurchasesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 1. Carga de datos
  const fetchAllPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = (session as any)?.accessToken;
      if (!token) return; // Esperamos a que cargue la sesión

      let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";
      baseUrl = baseUrl.replace(/\/$/, ""); 
      if (!baseUrl.endsWith("/api/v1")) baseUrl += "/api/v1";
      
      // Llamamos al endpoint de transacciones globales (limit 100 para no saturar)
      const res = await fetch(`${baseUrl}/transactions?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al obtener las ventas globales.");
      
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.items || data.data || []);
      
      // Filtramos para ver movimientos relevantes (compras, órdenes, depósitos)
      // O puedes quitar el filtro si quieres ver absolutamente todo
      setPurchases(list);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchAllPurchases();
  }, [session, fetchAllPurchases]);

  // 2. Lógica de Filtrado (Buscador)
  const filteredPurchases = purchases.filter(p => {
    const term = filter.toLowerCase();
    const note = (p.note || "").toLowerCase();
    const type = (p.type || "").toLowerCase();
    const id = p.id.toString();
    const userId = (p.user_id || "").toString();

    return note.includes(term) || type.includes(term) || id.includes(term) || userId.includes(term);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 rounded-xl shadow-sm">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ventas Globales</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Control Maestro de Transacciones
            </p>
          </div>
        </div>

        <button 
          onClick={fetchAllPurchases}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Cargando..." : "Actualizar Lista"}
        </button>
      </header>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
        <input 
          type="text"
          placeholder="🔍 Buscar por ID, Cliente, Producto o Tipo..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-red-500/10 focus:border-[#E33127] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* ESTADO DE ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* TABLA DE VENTAS */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              <tr>
                <th className="px-6 py-5 text-center w-20">ID</th>
                <th className="px-6 py-5">Concepto</th>
                <th className="px-6 py-5">Detalles</th>
                <th className="px-6 py-5">Fecha</th>
                <th className="px-6 py-5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && purchases.length === 0 ? (
                // Skeleton Loader
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredPurchases.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <BanknotesIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No se encontraron movimientos</p>
                  </td>
                </tr>
              ) : (
                // Lista Real
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                    
                    {/* ID */}
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        #{p.id}
                      </span>
                    </td>

                    {/* Concepto (Tipo + Status) */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 text-sm uppercase group-hover:text-[#E33127] transition-colors">
                          {p.type}
                        </span>
                        <StatusBadge status={p.type} />
                      </div>
                    </td>

                    {/* Nota / Cliente */}
                    <td className="px-6 py-5">
                       <div className="flex flex-col max-w-xs">
                          <span className="text-sm font-medium text-slate-600 truncate" title={p.note}>
                            {p.note || "—"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                            USER ID: {p.user_id}
                          </span>
                       </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-400">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("es-VE", { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '—'}
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="px-6 py-5 text-right">
                      <span className={`font-black text-base tracking-tight ${p.amount < 0 ? 'text-[#E33127]' : 'text-emerald-600'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.amount)}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de conteo */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium flex justify-between items-center">
            <span>Mostrando {filteredPurchases.length} registros</span>
            <span>Total: {purchases.length}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER DE ESTADO VISUAL ================= */
function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  
  if (s.includes('pend') || s.includes('proc')) {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase"><ClockIcon className="w-3 h-3"/> Pendiente</span>;
  }
  if (s.includes('rej') || s.includes('fail') || s.includes('cancel')) {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase"><XCircleIcon className="w-3 h-3"/> Fallido</span>;
  }
  // Default success
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase"><CheckCircleIcon className="w-3 h-3"/> Exitoso</span>;
}



