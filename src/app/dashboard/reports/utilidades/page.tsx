"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Asegúrate de tener: npm install jspdf-autotable
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
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

/* ================= CONFIG & UTILS ================= */

// 1. Conexión Inteligente (Usa la variable de entorno o el fallback)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";
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

interface UtilityTransaction {
  id: string | number;
  user_email?: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "INCOME" | "EXPENSE"; // Tipos comunes
  status: string;
  created_at: string;
  reference?: string;
}

interface UtilitiesData {
  total_income: number;
  total_withdrawn: number;
  net_system_balance: number;
  history: UtilityTransaction[]; 
}

interface ExtendedUser {
  accessToken?: string;
  token?: string;
  role?: string;
}

/* ================= HELPERS VISUALES ================= */
function getStatusColor(status: string) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED' || s === 'APPROVED' || s === 'SUCCESS') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (s === 'PENDING' || s === 'PROCESSING') return 'bg-amber-50 text-amber-600 border-amber-100';
  if (s === 'FAILED' || s === 'REJECTED') return 'bg-red-50 text-red-600 border-red-100';
  return 'bg-slate-50 text-slate-500 border-slate-100';
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

      if (!opts.silent) {
        if (!data) setInitialLoading(true);
        else setIsRefreshing(true);
        setError(null);
      }

      try {
        // Construcción limpia de URL para evitar dobles slashes
        const url = `${API_BASE}${UTILITIES_PATH}`;
        
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Endpoint no encontrado (404). Verifica la URL.");
          if (res.status === 401) throw new Error("Tu sesión ha expirado. Por favor, recarga.");
          throw new Error(`Error del servidor: ${res.status}`);
        }

        const json = await res.json();

        // Normalización Segura
        const normalized: UtilitiesData = {
          total_income: Number(json.total_income || json.ingresos || 0),
          total_withdrawn: Number(json.total_withdrawn || json.egresos || 0),
          net_system_balance: Number(json.net_system_balance || json.balance || 0),
          // Búsqueda inteligente del array de historial
          history: Array.isArray(json.history) 
            ? json.history 
            : Array.isArray(json.transactions) 
              ? json.transactions 
              : Array.isArray(json.movements)
                ? json.movements
                : [],
        };

        setData(normalized);
        setLastUpdated(new Date());
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message || "Error de conexión.");
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

  // Generador PDF
  const generatePDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(227, 49, 39); // Rojo Motostore
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte Financiero - Utilidades", 14, 13);
    
    // Info General
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Emisión: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Generado por: Admin`, 14, 35);

    // Resumen
    let y = 45;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Caja", 14, y);
    
    // Dibujar cajitas simples para el resumen
    y += 5;
    const kpis = [
      { label: "Ingresos", val: formatCurrency(data.total_income) },
      { label: "Egresos", val: formatCurrency(data.total_withdrawn) },
      { label: "Neto", val: formatCurrency(data.net_system_balance) }
    ];

    kpis.forEach((k, i) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(14 + (i*65), y, 60, 20, 'F');
        doc.setFontSize(8); doc.setTextColor(100);
        doc.text(k.label, 18 + (i*65), y + 8);
        doc.setFontSize(12); doc.setTextColor(0);
        doc.text(k.val, 18 + (i*65), y + 16);
    });

    // Tabla
    if (data.history.length > 0) {
      const tableRows = data.history.map((tx) => [
        formatDate(tx.created_at),
        tx.reference || "-",
        tx.type,
        formatCurrency(tx.amount),
        tx.status
      ]);

      (doc as any).autoTable({
        startY: y + 30,
        head: [["Fecha", "Referencia", "Tipo", "Monto", "Estado"]],
        body: tableRows,
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [241, 245, 249] }
      });
    }

    doc.save(`utilidades_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  /* ================= VISTAS ================= */

  if (initialLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 text-slate-400 animate-in fade-in">
        <PresentationChartLineIcon className="w-12 h-12 text-[#E33127] animate-bounce" />
        <span className="font-medium text-lg animate-pulse">Calculando finanzas...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-700">No se pudo cargar el reporte</h2>
        <p className="mt-2 text-red-600 font-medium">{error}</p>
        <button onClick={() => fetchData()} className="mt-6 rounded-xl border border-red-200 bg-white px-6 py-2 font-bold text-red-600 hover:bg-red-100 transition-all">Reintentar Conexión</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/20">
              <PresentationChartLineIcon className="h-8 w-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Utilidad Neta</h1>
              <p className="text-sm font-medium text-slate-500">Balance en tiempo real del sistema.</p>
           </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={() => fetchData()} 
                disabled={isRefreshing}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-[#E33127] hover:text-[#E33127] transition-all bg-white"
            >
                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}/>
            </button>
            <button 
                onClick={generatePDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E33127] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
                <DocumentTextIcon className="w-5 h-5"/>
                Descargar PDF
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
        <KpiCard
          title="Ingresos Totales"
          amount={data.total_income}
          subtitle="Depósitos y Ventas"
          color="emerald"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
        <KpiCard
          title="Egresos Totales"
          amount={data.total_withdrawn}
          subtitle="Retiros y Pagos Prov."
          color="red"
          icon={<ArrowDownIcon className="h-6 w-6" />}
        />
        <KpiCard
          title="Caja Neta Actual"
          amount={data.net_system_balance}
          subtitle="Disponible Real"
          color="indigo"
          highlight
          icon={<BanknotesIcon className="h-6 w-6" />}
        />
      </div>

      {/* TABLA */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-slate-400"/>
            Movimientos Recientes
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {data.history.length} Registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Usuario / Ref</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-right">Monto</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.history.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No hay datos para mostrar.</td></tr>
              ) : (
                data.history.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-xs">{tx.user_email || "Sistema"}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tx.reference || `TX-${tx.id}`}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                           tx.type.includes('DEPOSIT') || tx.type.includes('INCOME') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                       }`}>
                           {tx.type}
                       </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                        tx.type.includes('DEPOSIT') || tx.type.includes('INCOME') ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                        {tx.type.includes('DEPOSIT') ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(tx.status)}`}>
                            {tx.status}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTE KPI ================= */
function KpiCard({ title, amount, subtitle, color, icon, highlight }: any) {
  const styles = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-red-600 bg-red-50 border-red-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100"
  };
  // @ts-ignore
  const theme = styles[color] || styles.emerald;

  return (
    <div className={`relative p-6 rounded-3xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${highlight ? 'ring-1 ring-indigo-100 shadow-indigo-100' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-4">
         <div className={`p-3 rounded-2xl ${theme}`}>{icon}</div>
         {highlight && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(amount)}</h2>
      <p className="text-slate-400 text-xs font-medium mt-1">{subtitle}</p>
    </div>
  );
}




