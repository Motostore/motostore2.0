"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

/* ================= CONFIGURACIÓN ================= */
// 1. Conexión Directa a Render (Igual que en las otras páginas)
const API_BASE = "https://motostore-api.onrender.com/api/v1";
const ENDPOINT = "/reports/general"; // Asegúrate que esta ruta exista en tu Python
const REFRESH_MS = 30_000;

/* ================= TIPOS ================= */
type ReportData = {
  ventas: number;
  compras: number;
  utilidades: number;
  usuariosActivos: number;
  ticketPromedio: number;
  totalOrdenes: number;
  tasaConversion: number;
};

interface ExtendedUser {
  accessToken?: string;
  token?: string;
}

/* ================= ICONOS CUSTOM (SVG) ================= */
// Mantenemos tus iconos personalizados que están geniales
function IconDollar(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 1v22" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 5H10a3 3 0 000 6h4a3 3 0 010 6H7" /></svg>;
}
function IconCart(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-2 9H7L6 6Z" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" /><circle cx="9" cy="21" r="1" /><circle cx="17" cy="21" r="1" /></svg>;
}
function IconTrend(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 7h7v7" /></svg>;
}
function IconUsers(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" /></svg>;
}

/* ================= HELPERS ================= */
const fmtMoney = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("en-US", { // Estándar USD
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
};

const fmtNumber = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("es-ES").format(n);
};

/* ================= COMPONENTE PRINCIPAL ================= */
export default function ReportsGeneralPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 2. Extracción segura del Token
  const token = useMemo(() => {
    if (!session?.user) return null;
    const user = session.user as ExtendedUser;
    return user.accessToken || user.token || (session as any).accessToken || null;
  }, [session]);

  // 3. Fetch Optimizado
  const fetchData = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (status === "loading") return;

    if (!token) {
      if (status === "authenticated") setError("Token no encontrado.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    if (!opts.silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(`${API_BASE}${ENDPOINT}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo cargar el reporte general.`);
      }

      const json = await res.json();
      
      // Mapeo seguro para evitar crashes si falta algún campo
      const safeData: ReportData = {
        ventas: Number(json.ventas || 0),
        compras: Number(json.compras || 0),
        utilidades: Number(json.utilidades || 0),
        usuariosActivos: Number(json.usuariosActivos || 0),
        ticketPromedio: Number(json.ticketPromedio || 0),
        totalOrdenes: Number(json.totalOrdenes || 0),
        tasaConversion: Number(json.tasaConversion || 0),
      };

      setData(safeData);
      setLastUpdated(new Date());
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        setError(e.message || "Error al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [status, token]);

  // Efectos de Ciclo de Vida
  useEffect(() => {
    const cancel = fetchData();
    return () => { if (typeof cancel === 'function') cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || error) return;
    const id = setInterval(() => fetchData({ silent: true }), REFRESH_MS);
    return () => clearInterval(id);
  }, [status, fetchData, error]);

  // Generación de PDF
  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(227, 49, 39); // Rojo Motostore
    doc.text("Reporte General", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 28);

    // Cuerpo
    doc.setTextColor(0);
    doc.setFontSize(12);
    let y = 40;
    
    const lines = [
      `Ventas Totales: ${fmtMoney(data.ventas)}`,
      `Compras / Gastos: ${fmtMoney(data.compras)}`,
      `Utilidad Neta: ${fmtMoney(data.utilidades)}`,
      `Usuarios Activos: ${fmtNumber(data.usuariosActivos)}`,
      `Ticket Promedio: ${fmtMoney(data.ticketPromedio)}`,
      `Órdenes Totales: ${fmtNumber(data.totalOrdenes)}`,
      `Tasa de Conversión: ${data.tasaConversion}%`
    ];

    lines.forEach(line => {
      doc.text(line, 20, y);
      y += 10;
    });

    doc.save(`reporte_general_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Reporte General
          </h1>
          <p className="text-slate-500 font-medium">
            Visión panorámica del rendimiento del negocio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-400 hidden sm:block mr-2">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-[#E33127] transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={generatePDF}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#E33127] rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-100 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* KPI CARDS */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Ventas Totales"
          value={fmtMoney(data?.ventas)}
          icon={<IconDollar className="w-6 h-6 text-emerald-600" />}
          loading={loading}
          className="border-emerald-100 shadow-emerald-500/5"
          bgIcon="bg-emerald-50"
        />
        <KpiCard
          label="Compras / Gastos"
          value={fmtMoney(data?.compras)}
          icon={<IconCart className="w-6 h-6 text-blue-600" />}
          loading={loading}
          className="border-blue-100 shadow-blue-500/5"
          bgIcon="bg-blue-50"
        />
        <KpiCard
          label="Utilidad Neta"
          value={fmtMoney(data?.utilidades)}
          icon={<IconTrend className="w-6 h-6 text-indigo-600" />}
          loading={loading}
          className="border-indigo-100 shadow-indigo-500/5"
          bgIcon="bg-indigo-50"
        />
        <KpiCard
          label="Usuarios Activos"
          value={fmtNumber(data?.usuariosActivos)}
          icon={<IconUsers className="w-6 h-6 text-orange-600" />}
          loading={loading}
          className="border-orange-100 shadow-orange-500/5"
          bgIcon="bg-orange-50"
        />
      </section>

      {/* TABLE SECTION */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-bold text-slate-800">Métricas Operativas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Indicador</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <Row
                name="Ticket Promedio"
                value={fmtMoney(data?.ticketPromedio)}
                desc="Valor medio por transacción aprobada."
                status="Healthy"
                loading={loading}
              />
              <Row
                name="Órdenes Totales"
                value={fmtNumber(data?.totalOrdenes)}
                desc="Volumen total de operaciones procesadas."
                status="Neutral"
                loading={loading}
              />
              <Row
                name="Tasa de Conversión"
                value={
                  data?.tasaConversion !== undefined
                    ? `${data.tasaConversion}%`
                    : "—"
                }
                desc="Efectividad de ventas vs visitas."
                status={Number(data?.tasaConversion) > 5 ? "Healthy" : "Warning"}
                loading={loading}
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTES VISUALES ================= */

function KpiCard({ label, value, icon, loading, className, bgIcon }: any) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-xl transition-all hover:-translate-y-1 ${className || 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-2xl p-3 ${bgIcon || 'bg-slate-50'}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</h3>
        <div className="text-3xl font-black text-slate-900 tracking-tight">
          {loading ? <div className="h-9 w-24 bg-slate-100 rounded animate-pulse"></div> : value}
        </div>
      </div>
    </div>
  );
}

function Row({ name, value, desc, status, loading }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4 font-bold text-slate-700">{name}</td>
      <td className="px-6 py-4 font-mono font-medium text-slate-900">
        {loading ? <div className="h-5 w-16 bg-slate-100 rounded animate-pulse"></div> : value}
      </td>
      <td className="px-6 py-4 text-slate-400 text-xs sm:text-sm">{desc}</td>
      <td className="px-6 py-4 text-right">
        {!loading && (
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${
              status === "Healthy"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : status === "Warning"
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {status === "Healthy" ? "Bueno" : status === "Warning" ? "Revisar" : "Normal"}
          </span>
        )}
      </td>
    </tr>
  );
}



