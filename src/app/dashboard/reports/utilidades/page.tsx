"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // ⚠️ IMPORTANTE: Necesitas instalar esto: npm install jspdf-autotable
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowDownIcon,
  PresentationChartLineIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* ================= CONFIG & UTILS ================= */

// 1. Conexión a Render
const API_BASE = "https://motostore-api.onrender.com/api/v1";

const UTILITIES_PATH = "/reports/utilities";
const REFRESH_MS = 30_000;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ================= TIPOS ================= */

// Definimos la estructura de una transacción individual
interface UtilityTransaction {
  id: string | number;
  user_email?: string; // Opcional: Solo visible para admins
  amount: number;
  type: "DEPOSIT" | "WITHDRAW";
  status: string;
  created_at: string;
  reference?: string;
}

interface UtilitiesData {
  total_income: number;
  total_withdrawn: number;
  net_system_balance: number;
  // Agregamos el array de historial. Si el backend no lo envía aún, usaremos un array vacío por defecto.
  history: UtilityTransaction[]; 
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

interface ExtendedUser {
  accessToken?: string;
  token?: string;
  role?: string;
}

/* ================= COMPONENTE ICONO ================= */
function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}

/* ================= COMPONENTE PRINCIPAL ================= */
export default function UtilidadesPage() {
  const { data: session, status } = useSession();

  // Estados
  const [data, setData] = useState<UtilitiesData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Token & Rol
  const { token, role } = useMemo(() => {
    if (!session?.user) return { token: null, role: null };
    const user = session.user as ExtendedUser;
    return {
      token: user.accessToken || user.token || (session as any).accessToken || null,
      role: user.role || "user",
    };
  }, [session]);

  // Carga de Datos
  const fetchData = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (status === "loading") return;

      if (!token) {
        if (status === "authenticated") setError("Token de seguridad no encontrado.");
        setInitialLoading(false);
        return;
      }

      const controller = new AbortController();
      const signal = controller.signal;

      if (!opts.silent) {
        if (!data) setInitialLoading(true);
        else setIsRefreshing(true);
        setError(null);
      }

      try {
        const res = await fetch(`${API_BASE}${UTILITIES_PATH}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal,
        });

        if (!res.ok) {
          if (res.status === 403) throw new Error("Acceso Denegado: Permisos insuficientes.");
          if (res.status === 401) throw new Error("Sesión expirada.");
          const errorData = (await res.json().catch(() => ({}))) as ApiErrorResponse;
          throw new Error(errorData.detail || errorData.message || `Error del servidor (${res.status})`);
        }

        const json = await res.json();

        // Normalización Segura
        const normalized: UtilitiesData = {
          total_income: Number(json.total_income) || 0,
          total_withdrawn: Number(json.total_withdrawn) || 0,
          net_system_balance: Number(json.net_system_balance) || 0,
          // Si el backend envía 'transactions', 'history' o 'movements', lo usamos. Si no, array vacío.
          history: Array.isArray(json.history) 
            ? json.history 
            : Array.isArray(json.transactions) 
              ? json.transactions 
              : [],
        };

        setData(normalized);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Ocurrió un error inesperado.");
      } finally {
        setInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [status, token, data]
  );

  // Efectos
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || error) return;
    const intervalId = setInterval(() => fetchData({ silent: true }), REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [status, fetchData, error]);

  // Generador PDF con Tabla
  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    let y = 20;

    // Encabezado
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Utilidades y Caja", 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, y);
    
    // Resumen KPI
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Global", 20, y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Ingresos Totales: ${formatCurrency(data.total_income)}`, 20, y);
    y += 6;
    doc.text(`Egresos Totales: ${formatCurrency(data.total_withdrawn)}`, 20, y);
    y += 6;
    doc.text(`Balance Neto: ${formatCurrency(data.net_system_balance)}`, 20, y);

    // Tabla Historial (Requiere jspdf-autotable)
    if (data.history.length > 0) {
      y += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Últimos Movimientos", 20, y);

      // Mapeo de datos para la tabla
      const tableRows = data.history.map((tx) => [
        formatDate(tx.created_at),
        tx.user_email || "N/A",
        tx.type,
        formatCurrency(tx.amount),
        tx.status,
      ]);

      (doc as any).autoTable({
        startY: y + 5,
        head: [["Fecha", "Usuario", "Tipo", "Monto", "Estado"]],
        body: tableRows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [227, 49, 39] }, // Rojo Motostore
      });
    }

    doc.save(`reporte_utilidades_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  /* ================= RENDERS ================= */

  if (initialLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 text-slate-400 animate-in fade-in">
        <PresentationChartLineIcon className="w-10 h-10 text-[#E33127] animate-bounce" />
        <span className="font-medium text-lg animate-pulse">Sincronizando finanzas...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-700">Error de Conexión</h2>
        <p className="mt-2 text-red-600">{error}</p>
        <button onClick={() => fetchData()} className="mt-6 rounded-lg border border-red-200 bg-white px-6 py-2.5 font-bold text-red-600 hover:bg-red-50 transition-all">Reintentar</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER DE CONTROL */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm text-indigo-600">
            <PresentationChartLineIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Utilidades y Caja</h1>
            <p className="text-sm font-medium text-slate-500">
              {role === 'admin' || role === 'superuser' ? "Vista Global del Sistema (Admin)" : "Mi Historial de Utilidades"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-xs text-slate-400 text-right mr-2">
            <p>{isRefreshing ? "Sincronizando..." : `Actualizado: ${lastUpdated?.toLocaleTimeString()}`}</p>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-400 hover:bg-slate-50 hover:text-[#E33127] hover:border-slate-200 transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 rounded-xl bg-[#E33127] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-100 transition-transform hover:bg-red-700 hover:-translate-y-0.5"
          >
            <IconDownload className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* KPI GRID (Tarjetas Superiores) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
        <KpiCard
          title="Ingresos Totales"
          amount={data.total_income}
          subtitle="Acumulado histórico"
          color="emerald"
          icon={<ArrowTrendingUpIcon className="h-24 w-24 text-emerald-500" />}
          smallIcon={<ArrowTrendingUpIcon className="h-4 w-4" />}
        />
        <KpiCard
          title="Egresos Totales"
          amount={data.total_withdrawn}
          subtitle="Retiros procesados"
          color="red"
          icon={<ArrowDownIcon className="h-24 w-24 text-red-500" />}
          smallIcon={<ArrowDownIcon className="h-4 w-4" />}
        />
        <KpiCard
          title="Dinero en Sistema"
          amount={data.net_system_balance}
          subtitle="Pasivo circulante"
          color="emerald"
          highlight
          icon={<BanknotesIcon className="h-24 w-24 text-emerald-600" />}
          smallIcon={<BanknotesIcon className="h-4 w-4" />}
        />
      </div>

      {/* TABLA DE HISTORIAL DETALLADO */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-5 flex items-center gap-3 bg-slate-50/50">
          <DocumentTextIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800">Historial de Movimientos</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                {/* Solo mostramos columna Usuario si hay datos (Admin/Superuser) */}
                {(data.history[0]?.user_email) && <th className="px-6 py-4">Usuario</th>}
                <th className="px-6 py-4">Referencia</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDaysIcon className="w-8 h-8 opacity-20" />
                      <p>No hay movimientos registrados en este periodo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.history.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(tx.created_at)}
                    </td>
                    
                    {tx.user_email && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="w-4 h-4 text-slate-300" />
                          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {tx.user_email}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {tx.reference || `REF-${tx.id}`}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tx.type === 'DEPOSIT' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {tx.type === 'DEPOSIT' ? 'Ingreso' : 'Retiro'}
                      </span>
                    </td>

                    <td className={`px-6 py-4 text-right font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de Tabla (Paginación simple si se requiere futuro) */}
        {data.history.length > 0 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Mostrando los últimos {data.history.length} movimientos
          </div>
        )}
      </div>

    </div>
  );
}

/* ================= COMPONENTE DE TARJETA (Reutilizable) ================= */
interface KpiCardProps {
  title: string;
  amount: number;
  subtitle: string;
  color: "emerald" | "red";
  icon: React.ReactNode;
  smallIcon: React.ReactNode;
  highlight?: boolean;
}

function KpiCard({ title, amount, subtitle, color, icon, smallIcon, highlight }: KpiCardProps) {
  const colorClasses = {
    emerald: { bgIcon: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-100", shadow: "shadow-emerald-500/5", glow: "bg-emerald-500/10" },
    red: { bgIcon: "bg-red-100", text: "text-red-600", border: "border-red-100", shadow: "shadow-red-500/5", glow: "bg-red-500/10" },
  };
  const theme = colorClasses[color];

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-8 shadow-xl transition-all hover:-translate-y-1 ${theme.border} ${theme.shadow} group`}>
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none">{icon}</div>
      {highlight && <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${theme.glow}`}></div>}
      <div className={`relative z-10 mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider ${theme.text}`}>
        <span className={`rounded-lg p-1.5 ${theme.bgIcon}`}>{smallIcon}</span>
        {title}
      </div>
      <p className="relative z-10 mb-1 text-4xl font-black tracking-tight text-slate-900">{formatCurrency(amount)}</p>
      <p className="relative z-10 text-sm font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}




