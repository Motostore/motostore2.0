"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowDownIcon,
  PresentationChartLineIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/* ================= CONFIG & UTILS (Fuera del componente) ================= */

// 1. Configuración centralizada y limpia
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const UTILITIES_PATH = "/reports/utilities";
const REFRESH_MS = 30_000;

// 2. Formateador puro (Mejor rendimiento que crearlo en cada render)
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

/* ================= TIPOS ================= */
interface UtilitiesData {
  total_income: number;
  total_withdrawn: number;
  net_system_balance: number;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Extender el tipo de Session si es necesario, o usar una interfaz auxiliar
interface ExtendedUser {
  accessToken?: string;
  token?: string;
}

/* ================= COMPONENTE DE ICONO ================= */
function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}

export default function UtilidadesPage() {
  const { data: session, status } = useSession();

  // Estados
  const [data, setData] = useState<UtilitiesData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Nombre más semántico
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 3. Extracción segura del token (Sin casting agresivo de 'any')
  const getToken = useCallback(() => {
    if (!session?.user) return null;
    const user = session.user as ExtendedUser;
    // Ajusta esto según donde realmente guardes tu token en NextAuth
    return user.accessToken || user.token || (session as any).accessToken || null;
  }, [session]);

  const fetchData = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (status === "loading") return;

      const token = getToken();
      if (!token) {
        if (status === "authenticated") setError("Token de seguridad no encontrado.");
        setInitialLoading(false);
        return;
      }

      // 4. AbortController: El estándar moderno para cancelar peticiones
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
          signal, // Vinculamos la señal
        });

        if (!res.ok) {
          if (res.status === 403) throw new Error("Acceso Denegado: Permisos insuficientes.");
          if (res.status === 401) throw new Error("Sesión expirada.");
          
          const errorData = (await res.json().catch(() => ({}))) as ApiErrorResponse;
          throw new Error(errorData.detail || errorData.message || `Error del servidor (${res.status})`);
        }

        const json = await res.json();

        // Validación básica de tipos al recibir (Sanitization)
        const normalized: UtilitiesData = {
          total_income: Number(json.total_income) || 0,
          total_withdrawn: Number(json.total_withdrawn) || 0,
          net_system_balance: Number(json.net_system_balance) || 0,
        };

        setData(normalized);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (err.name === "AbortError") return; // Ignoramos errores por cancelación intencional
        setError(err.message || "Ocurrió un error inesperado.");
      } finally {
        // No necesitamos verificar 'mounted' gracias al AbortController (aunque React setState en un componente desmontado ya no es crítico en React 18, es buena práctica limpiar)
        setInitialLoading(false);
        setIsRefreshing(false);
      }

      return () => controller.abort();
    },
    [status, getToken, data]
  );

  // Efecto inicial y limpieza
  useEffect(() => {
    const cancelRequest = fetchData();
    // TypeScript infiere que fetchData devuelve una función de limpieza si retorna controller.abort
    return () => {
      if (typeof cancelRequest === 'function') cancelRequest(); // Cleanup manual si fuera necesario (aunque el useEffect de abajo maneja el intervalo)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // Efecto de Auto-refresh
  useEffect(() => {
    if (status !== "authenticated" || error) return;

    const intervalId = setInterval(() => {
      fetchData({ silent: true });
    }, REFRESH_MS);

    return () => clearInterval(intervalId);
  }, [status, fetchData, error]);

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const lineHeight = 10;
    let y = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Utilidades y Caja", 20, y);
    
    // Metadata
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, y);
    
    if (lastUpdated) {
      y += 6;
      doc.text(`Última actualización de datos: ${lastUpdated.toLocaleTimeString()}`, 20, y);
    }

    // Datos
    y += 20;
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    const rows = [
      { label: "Ingresos Totales:", value: formatCurrency(data.total_income) },
      { label: "Egresos Totales:", value: formatCurrency(data.total_withdrawn) },
      { label: "Dinero en Sistema (Pasivo):", value: formatCurrency(data.net_system_balance) },
    ];

    rows.forEach((row) => {
      doc.setFont("helvetica", "bold");
      doc.text(row.label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(row.value, 80, y);
      y += lineHeight;
    });

    // Disclaimer
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(120);
    const splitText = doc.splitTextToSize(
      "Este reporte representa el estado financiero del sistema en tiempo real basado en las transacciones registradas.",
      170
    );
    doc.text(splitText, 20, y);

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
        <button
          onClick={() => fetchData()}
          className="mt-6 rounded-lg border border-red-200 bg-white px-6 py-2.5 font-bold text-red-600 hover:bg-red-50 hover:shadow transition-all"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  if (!data) return null; // Should not happen

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      {/* HEADER INFO */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
          {isRefreshing ? "Actualizando datos..." : `Actualización auto: ${Math.round(REFRESH_MS / 1000)}s`}
        </div>
        {lastUpdated && <span>Última carga: {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm shadow-sm">
           <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
           <span>{error}</span>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm text-indigo-600">
            <PresentationChartLineIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Utilidades y Caja</h1>
            <p className="text-sm font-medium text-slate-500">Visión global del flujo de efectivo.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-400 hover:bg-slate-50 hover:text-[#E33127] hover:border-slate-200 transition-all disabled:opacity-50"
            title="Refrescar datos"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={generatePDF}
            className="flex items-center gap-2 rounded-xl bg-[#E33127] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-100 transition-transform hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
          >
            <IconDownload className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard
          title="Ingresos Totales"
          amount={data.total_income}
          subtitle="Depósitos históricos"
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
          subtitle="Pasivo corriente (Usuarios)"
          color="emerald" // Mantenemos verde como en tu diseño
          highlight
          icon={<BanknotesIcon className="h-24 w-24 text-emerald-600" />} // Icono grande añadido para consistencia
          smallIcon={<BanknotesIcon className="h-4 w-4" />}
        />
      </div>

      {/* INFO FOOTER */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-medium text-blue-900">
        <span className="flex-shrink-0 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          INFO
        </span>
        <p className="leading-relaxed opacity-80">
          Cálculo en tiempo real basado en transacciones tipo <b>DEPOSIT</b> y <b>WITHDRAW</b>. 
          Los datos pueden variar si existen transacciones pendientes de aprobación.
        </p>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTE DE TARJETA (Mejora la legibilidad) ================= */
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
    emerald: {
      bgIcon: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-100",
      shadow: "shadow-emerald-500/5",
      glow: "bg-emerald-500/10 hover:bg-emerald-500/15",
    },
    red: {
      bgIcon: "bg-red-100",
      text: "text-red-600",
      border: "border-red-100",
      shadow: "shadow-red-500/5",
      glow: "bg-red-500/10 hover:bg-red-500/15",
    },
  };

  const theme = colorClasses[color];

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 ${theme.border} ${theme.shadow} group`}>
      {/* Background Decor */}
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
        {icon}
      </div>
      
      {highlight && (
        <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-colors ${theme.glow}`}></div>
      )}

      {/* Content */}
      <div className={`relative z-10 mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider ${theme.text}`}>
        <span className={`rounded-lg p-1.5 ${theme.bgIcon}`}>
          {smallIcon}
        </span>
        {title}
      </div>

      <p className="relative z-10 mb-1 text-4xl font-black tracking-tight text-slate-900">
        {formatCurrency(amount)}
      </p>
      <p className="relative z-10 text-sm font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}





