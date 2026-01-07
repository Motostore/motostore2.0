'use client';

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import {
  BanknotesIcon,
  ArrowPathIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  GlobeAmericasIcon,
  UserCircleIcon,
  UserIcon
} from "@heroicons/react/24/outline";

/* ================= HELPERS & TYPES ================= */

type TransactionRow = {
  id: number | string;
  user_id: number | string; 
  username: string;
  type: string; 
  amount: number;
  status: string; 
  reference?: string;
  description?: string;
  note?: string; 
  created_at: string | Date;
};

// URL de producción por defecto para evitar errores si falta el .env
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://motostore-api.onrender.com/api/v1').replace(/\/+$/,'');

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

// Helper unificado para normalizar el estado
function getNormalizedStatus(t: TransactionRow): string {
  const type = (t.type || "").toUpperCase();
  const status = (t.status || "").toUpperCase();

  if (type.includes("PAYMENT-")) return type.split("-").pop() || 'UNKNOWN';
  if (type.includes("WITHDRAW_REQUEST")) return "PENDING";
  if (type.includes("WITHDRAW")) return "COMPLETED"; 
  if (type.includes("REFUND")) return "COMPLETED";
  if (type.includes("ORDER")) return "COMPLETED";
  
  return status || type; // Fallback
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: 'auto' }).format(n);
}

function formatDate(d: string | Date) {
  try {
    return new Date(d).toLocaleString("es-VE", { 
      day: "2-digit", month: "short", year: "numeric", 
      hour: "2-digit", minute: "2-digit" 
    });
  } catch { return "—"; }
}

const getIconAndColor = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("DEPOSIT")) return { icon: ArrowUpCircleIcon, color: "text-emerald-600 bg-emerald-50" };
    if (t.includes("WITHDRAW")) return { icon: ArrowDownCircleIcon, color: "text-red-600 bg-red-50" };
    if (t.includes("ORDER") || t.includes("PURCHASE")) return { icon: CreditCardIcon, color: "text-blue-600 bg-blue-50" };
    if (t.includes("PAYMENT")) return { icon: BanknotesIcon, color: "text-amber-600 bg-amber-50" };
    return { icon: QuestionMarkCircleIcon, color: "text-slate-400 bg-slate-50" };
};

/* ================= COMPONENT ================= */

export default function UsersTransactionsPage() {
  const { data: session, status } = useSession();
  const token = useMemo(() => pickToken(session), [session]);

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros internos (aunque visualmente los quitamos, mantenemos la lógica base limpia)
  const [isGlobalReport, setIsGlobalReport] = useState(false); 
  
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERUSER';

  // Efecto para activar reporte global por defecto si es admin
  useEffect(() => { if (isAdmin) setIsGlobalReport(true); }, [isAdmin]);

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  // Cargar Transacciones
  const loadData = useCallback(async () => {
    if (!authHeader || status !== 'authenticated') return;
    setLoading(true);
    
    // Endpoint dinámico
    let endpoint = isGlobalReport ? "/transactions/all" : "/transactions";

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { headers: { ...authHeader, "Content-Type": "application/json" }, cache: "no-store" });
      
      if (!res.ok) {
         if (res.status === 404) { setTransactions([]); return; }
         throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      const normalizedList = list.map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        username: t.username ?? session?.user?.name ?? "Usuario",
        type: (t.type || "").toUpperCase(),
        amount: Number(t.amount),
        status: t.status, 
        reference: t.reference,
        description: t.description ?? t.note,
        note: t.note,
        created_at: t.created_at
      }));

      // Ordenar por fecha descendente
      setTransactions(normalizedList.sort((a: TransactionRow, b: TransactionRow) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authHeader, isGlobalReport, session?.user?.name, status]); 

  useEffect(() => { loadData(); }, [loadData]);

  // Renderizado de Estado (Badges)
  const renderStatus = (tx: TransactionRow) => {
    const s = getNormalizedStatus(tx);

    if (s === "APPROVED" || s === "COMPLETED") return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircleIcon className="w-3 h-3"/> Completado</span>;
    if (s === "PENDING" || s === "REQUEST") return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200"><ClockIcon className="w-3 h-3"/> Pendiente</span>;
    if (s === "REJECTED" || s === "CANCELLED" || s.includes("REJECTED")) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200"><XCircleIcon className="w-3 h-3"/> Rechazado</span>;
    
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">{s}</span>;
  };

  // Renderizado de Tipo (Texto)
  const renderTypeLabel = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("DEPOSIT") || t.includes("REFUND")) return "Ingreso"; 
    if (t.includes("WITHDRAW")) return "Retiro"; 
    if (t.includes("PURCHASE") || t.includes("ORDER")) return "Compra";
    if (t.includes("PAYMENT")) return "Pago Móvil";
    return t.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 animate-fadeIn">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }}/>

      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl">
                    <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Historial Financiero
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {isGlobalReport ? "Supervisión global de movimientos" : "Detalle de tus movimientos y saldo"}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {isAdmin && (
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setIsGlobalReport(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isGlobalReport ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2"><UserCircleIcon className="w-4 h-4"/> Mis Datos</div>
                        </button>
                        <button 
                            onClick={() => setIsGlobalReport(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isGlobalReport ? 'bg-white text-[#E33127] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2"><GlobeAmericasIcon className="w-4 h-4"/> Global</div>
                        </button>
                    </div>
                )}

                <button onClick={loadData} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-[#E33127] rounded-xl transition-all" title="Actualizar">
                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* TABLA DE DATOS */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                            {isGlobalReport && <th className="px-6 py-4">Usuario</th>}
                            <th className="px-6 py-4">Movimiento</th>
                            <th className="px-6 py-4">Detalle</th>
                            <th className="px-6 py-4 text-right">Monto</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {isGlobalReport && <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>}
                                    <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-100 rounded-full"></div></td>
                                    <td className="px-6 py-4 space-y-2"><div className="h-3 bg-slate-100 rounded w-32"></div><div className="h-2 bg-slate-50 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-3 bg-slate-100 rounded w-24 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={isGlobalReport ? 6 : 5} className="px-6 py-16 text-center text-slate-400">
                                    <BanknotesIcon className="w-12 h-12 mx-auto mb-2 text-slate-200"/>
                                    <p className="font-medium">No se encontraron movimientos registrados.</p>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((row) => {
                                const { color: iconClass, icon: Icon } = getIconAndColor(row.type);
                                const isOrder = row.type.includes('ORDER');
                                const isPositive = row.amount > 0 && !isOrder;
                                const displayAmount = isOrder ? -Math.abs(row.amount) : row.amount;

                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                        
                                        {/* USUARIO (Solo Global) */}
                                        {isGlobalReport && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                                        {row.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">{row.username}</span>
                                                </div>
                                            </td>
                                        )}

                                        {/* TIPO */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${iconClass}`}>
                                                    <Icon className="w-5 h-5"/>
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{renderTypeLabel(row.type)}</span>
                                            </div>
                                        </td>

                                        {/* REFERENCIA / DETALLE */}
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="truncate text-sm font-medium text-slate-600" title={row.note}>
                                                {row.note || row.description || 'Sin detalle'}
                                            </div>
                                            {row.reference && (
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {row.reference}</div>
                                            )}
                                        </td>

                                        {/* MONTO */}
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-mono font-black text-sm ${
                                                isPositive ? 'text-emerald-600' : 'text-slate-800'
                                            }`}>
                                                {formatMoney(displayAmount)}
                                            </span>
                                        </td>

                                        {/* ESTADO */}
                                        <td className="px-6 py-4 text-center">
                                            {renderStatus(row)}
                                        </td>

                                        {/* FECHA */}
                                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">
                                            {formatDate(row.created_at)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* FOOTER INFO */}
        <div className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
            Mostrando {transactions.length} registros
        </div>

      </div>
    </div>
  );
}