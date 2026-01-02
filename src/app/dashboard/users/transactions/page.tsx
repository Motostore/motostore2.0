'use client';

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon // Añadido para default
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

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/,'');

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    try {
        const err = JSON.parse(txt);
        throw new Error(err.detail || `HTTP ${res.status}`);
    } catch {
        throw new Error(txt || `HTTP ${res.status}`);
    }
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
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

// 💎 FIX 2: Función auxiliar faltante para obtener iconos
const getIconAndColor = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("DEPOSIT")) return { icon: ArrowUpCircleIcon, color: "text-emerald-600" };
    if (t.includes("WITHDRAW")) return { icon: ArrowDownCircleIcon, color: "text-red-600" };
    if (t.includes("ORDER") || t.includes("PURCHASE")) return { icon: CreditCardIcon, color: "text-blue-600" };
    if (t.includes("PAYMENT")) return { icon: BanknotesIcon, color: "text-amber-600" };
    return { icon: QuestionMarkCircleIcon, color: "text-slate-400" };
};

/* ================= COMPONENT ================= */

export default function UsersTransactionsPage() {
  const { data: session, status } = useSession();
  const token = useMemo(() => pickToken(session), [session]);

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERUSER';

  const [isGlobalReport, setIsGlobalReport] = useState(isAdmin); 

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  // Cargar Transacciones
  const loadData = useCallback(async () => {
    if (!authHeader || status !== 'authenticated') return;
    setLoading(true);
    
    let endpoint = isGlobalReport ? "/transactions/all" : "/transactions";
    
    if (isGlobalReport && q) {
        endpoint += `?q=${encodeURIComponent(q)}`;
    }

    try {
      const data = await api(`${API_BASE}${endpoint}`, { headers: authHeader, cache: "no-store" });
      const list = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      const normalizedList = list.map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        username: t.username ?? session?.user?.name ?? "Usuario",
        type: (t.type || "").toUpperCase(),
        amount: Number(t.amount),
        status: (t.type || "").includes("payment-") ? t.type.split("-").pop().toUpperCase() : (t.status || t.type).toUpperCase(),
        reference: t.reference,
        description: t.description ?? t.note,
        note: t.note,
        created_at: t.created_at
      }));

      const filteredList = normalizedList.filter((t: TransactionRow) => {
        const matchType = typeFilter === "ALL" || t.type.includes(typeFilter);
        
        let currentStatus = t.type;
        if (t.type.includes("PAYMENT-")) {
            currentStatus = t.type.split("-").pop()?.toUpperCase() || 'UNKNOWN';
        } else if (t.type.includes("WITHDRAW")) {
            currentStatus = t.type.includes("REQUEST") ? "PENDING" : "COMPLETED";
        } else if (t.type.includes("ORDER")) {
            currentStatus = "COMPLETED"; 
        }
        
        const matchStatus = statusFilter === "ALL" || currentStatus.includes(statusFilter);

        const matchQ = q === "" || 
            t.username.toLowerCase().includes(q.toLowerCase()) || 
            (t.reference || "").toLowerCase().includes(q.toLowerCase()) ||
            (t.note || "").toLowerCase().includes(q.toLowerCase());

        return matchType && matchStatus && matchQ;
      });

      // 💎 FIX 1: Tipamos a y b como 'any' para evitar error TS
      setTransactions(filteredList.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (e: any) {
      console.error(e);
      toast.error(`Error al cargar transacciones: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [authHeader, isGlobalReport, q, typeFilter, statusFilter, session?.user?.name, status]); 

  useEffect(() => { loadData(); }, [loadData]);


  // Renderizado de Estado (Badges)
  const renderStatus = (tx: TransactionRow) => {
    let s = (tx.type || "").toUpperCase();
    
    if (s.includes("PAYMENT-")) s = s.split("-").pop() || 'UNKNOWN';
    if (s.includes("WITHDRAW_REQUEST")) s = "PENDING";
    if (s.includes("WITHDRAW")) s = "COMPLETED"; 
    if (s.includes("REFUND")) s = "COMPLETED";

    if (s === "APPROVED" || s === "COMPLETED") return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircleIcon className="w-3 h-3"/> Completado</span>;
    if (s === "PENDING" || s === "REQUEST") return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><ClockIcon className="w-3 h-3"/> Pendiente</span>;
    if (s === "REJECTED" || s === "CANCELLED" || s.includes("REJECTED")) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><XCircleIcon className="w-3 h-3"/> Rechazado</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{s}</span>;
  };

  // Renderizado de Tipo (Iconos)
  const renderType = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("DEPOSIT") || t.includes("REFUND")) return <div className="flex items-center gap-2 text-emerald-600 font-bold"><ArrowUpCircleIcon className="w-5 h-5"/> Ingreso</div>; 
    if (t.includes("WITHDRAW")) return <div className="flex items-center gap-2 text-red-600 font-bold"><ArrowDownCircleIcon className="w-5 h-5"/> Retiro</div>; 
    if (t.includes("PURCHASE") || t.includes("ORDER")) return <div className="flex items-center gap-2 text-blue-600 font-bold"><CreditCardIcon className="w-5 h-5"/> Compra/Pedido</div>;
    if (t.includes("PAYMENT")) return <div className="flex items-center gap-2 text-yellow-600 font-bold"><BanknotesIcon className="w-5 h-5"/> Sol. Pago</div>;
    return <span className="text-slate-600 font-medium capitalize">{t.replace(/_/g, ' ').toLowerCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                    <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Historial de Transacciones
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {isGlobalReport ? "Historial global de movimientos financieros." : "Tu historial personal de movimientos financieros."}
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 items-center">
                {isAdmin && (
                    <button 
                        onClick={() => setIsGlobalReport(!isGlobalReport)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                        {isGlobalReport ? 'Ver Mis Transacciones' : 'Ver Reporte Global'}
                    </button>
                )}

                <button onClick={loadData} className="p-2 text-slate-400 hover:text-[#E33127] hover:bg-red-50 rounded-xl transition-all" title="Recargar datos">
                    <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center">
            
            {(isGlobalReport || !isAdmin) && (
                <div className="relative flex-grow w-full lg:w-auto">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        value={q} onChange={e => setQ(e.target.value)}
                        placeholder="Buscar por usuario, nota, o referencia..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all"
                    />
                </div>
            )}

            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                <div className="relative min-w-[160px]">
                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <select 
                        value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold focus:border-[#E33127] outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
                    >
                        <option value="ALL">Todos los Tipos</option>
                        <option value="DEPOSIT">Ingreso/Recarga</option>
                        <option value="ORDER">Pedidos/Compra</option>
                        <option value="WITHDRAW">Retiros</option>
                        <option value="REFUND">Reembolso</option>
                        <option value="PAYMENT">Sol. Pago</option>
                    </select>
                </div>

                <div className="relative min-w-[160px]">
                    <select 
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold focus:border-[#E33127] outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="COMPLETED">Completados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="REJECTED">Rechazados</option>
                    </select>
                </div>
            </div>
        </div>

        {/* TABLA DE DATOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                            {isGlobalReport && <th className="px-6 py-4">Usuario</th>}
                            <th className="px-6 py-4">Tipo Movimiento</th>
                            <th className="px-6 py-4">Detalle / Nota</th>
                            <th className="px-6 py-4 text-right">Monto</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {isGlobalReport && <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>}
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={isGlobalReport ? 6 : 5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                    No se encontraron movimientos registrados.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((row) => {
                                const { color: iconColor, icon: Icon } = getIconAndColor(row.type);
                                const isPositive = row.amount > 0 && !row.type.includes('ORDER');
                                const isOrder = row.type.includes('ORDER');
                                const displayAmount = isOrder ? -Math.abs(row.amount) : row.amount;

                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                        
                                        {/* USUARIO (Solo Global) */}
                                        {isGlobalReport && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <UserIcon className="w-4 h-4"/>
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{row.username}</span>
                                                </div>
                                            </td>
                                        )}

                                        {/* TIPO */}
                                        <td className="px-6 py-4">
                                            {renderType(row.type)}
                                        </td>

                                        {/* REFERENCIA / DETALLE */}
                                        <td className="px-6 py-4 max-w-xs truncate" title={row.note}>
                                            <span className="text-sm text-slate-600">{row.note || '---'}</span>
                                        </td>

                                        {/* MONTO */}
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-mono font-bold text-sm ${
                                                isPositive ? 'text-emerald-600' : 
                                                isOrder ? 'text-red-600' : 'text-red-600' // Negativos y órdenes van en rojo
                                            }`}>
                                                {formatMoney(displayAmount)}
                                            </span>
                                        </td>

                                        {/* ESTADO */}
                                        <td className="px-6 py-4 text-center">
                                            {renderStatus(row)}
                                        </td>

                                        {/* FECHA */}
                                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">
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
        <div className="text-center text-xs text-slate-400 pt-4">
            Mostrando {transactions.length} transacciones recientes.
        </div>

      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}