"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";

/* ================= ICONOS (sin lucide-react) ================= */
function IconDollar(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 1v22" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 5H10a3 3 0 000 6h4a3 3 0 010 6H7" />
    </svg>
  );
}
function IconCart(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-2 9H7L6 6Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}
function IconTrend(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 7h7v7" />
    </svg>
  );
}
function IconUsers(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
function IconDownload(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}
function IconRefresh(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 4v6h-6" />
    </svg>
  );
}
function IconAlert(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
    </svg>
  );
}

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

/* ================= CONFIG ================= */
function getApiBase(): string {
  const base =
    (process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_FULL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "").trim();

  return base.replace(/\/+$/, "");
}

export default function ReportsGeneralPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const base = getApiBase();
      if (!base) {
        throw new Error(
          "Falta la URL del backend en Vercel: NEXT_PUBLIC_API_BASE_URL (o NEXT_PUBLIC_API_FULL)."
        );
      }

      const accessToken = (session as any)?.accessToken as string | undefined;
      if (!accessToken) {
        throw new Error(
          "No hay sesión o token. Inicia sesión como ADMIN/SUPERUSER para ver reportes reales."
        );
      }

      const url = `${base}/api/v1/reports/general`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Backend respondió ${res.status}. ${txt ? txt.slice(0, 200) : ""}`.trim()
        );
      }

      const json = (await res.json()) as ReportData;
      setData(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error(e);
      setData(null);
      setErr(e?.message || "No se pudieron cargar los reportes reales.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // ✅ AUTO-REFRESH: negocio MUY activo (cada 30 segundos)
  useEffect(() => {
    if (status === "loading") return;

    fetchData(); // carga inicial

    const id = window.setInterval(() => {
      fetchData();
    }, 30000); // 30 segundos

    return () => window.clearInterval(id);
  }, [status, fetchData]);

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte General", 20, 20);

    doc.setFontSize(12);
    doc.text(`Ventas Totales: ${fmtMoney(data.ventas)}`, 20, 35);
    doc.text(`Compras / Gastos: ${fmtMoney(data.compras)}`, 20, 45);
    doc.text(`Utilidad Neta: ${fmtMoney(data.utilidades)}`, 20, 55);
    doc.text(`Usuarios Activos: ${fmtNumber(data.usuariosActivos)}`, 20, 65);
    doc.text(`Ticket Promedio: ${fmtMoney(data.ticketPromedio)}`, 20, 75);
    doc.text(`Órdenes Totales: ${fmtNumber(data.totalOrdenes)}`, 20, 85);
    doc.text(`Tasa de Conversión: ${data.tasaConversion}%`, 20, 95);

    doc.save("reporte_general.pdf");
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Reporte General
          </h1>
          <p className="text-slate-500 mt-1">
            Visión general del rendimiento de tu negocio en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            type="button"
            onClick={generatePDF}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E33127] rounded-lg hover:bg-red-700 transition-opacity shadow-md shadow-red-200 disabled:opacity-50"
          >
            <IconDownload className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </header>

      {err && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <IconAlert className="w-5 h-5" />
          <span className="text-sm font-medium">{err}</span>
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ventas Totales"
          value={fmtMoney(data?.ventas)}
          icon={<IconDollar className="w-6 h-6 text-emerald-600" />}
          loading={loading}
        />
        <KpiCard
          label="Compras / Gastos"
          value={fmtMoney(data?.compras)}
          icon={<IconCart className="w-6 h-6 text-blue-600" />}
          loading={loading}
        />
        <KpiCard
          label="Utilidad Neta"
          value={fmtMoney(data?.utilidades)}
          icon={<IconTrend className="w-6 h-6 text-indigo-600" />}
          loading={loading}
        />
        <KpiCard
          label="Usuarios Activos"
          value={fmtNumber(data?.usuariosActivos)}
          icon={<IconUsers className="w-6 h-6 text-orange-600" />}
          loading={loading}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Métricas de Operación</h3>
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Métrica</th>
                <th className="px-6 py-3">Valor Actual</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <Row
                name="Ticket Promedio"
                value={fmtMoney(data?.ticketPromedio)}
                desc="Valor promedio de cada venta realizada."
                status="Healthy"
                loading={loading}
              />
              <Row
                name="Órdenes Totales"
                value={fmtNumber(data?.totalOrdenes)}
                desc="Cantidad total de transacciones procesadas."
                status="Neutral"
                loading={loading}
              />
              <Row
                name="Tasa de Conversión"
                value={
                  data?.tasaConversion !== undefined && data?.tasaConversion !== null
                    ? `${data.tasaConversion}%`
                    : "—"
                }
                desc="Porcentaje de visitas que terminan en venta."
                status="Warning"
                loading={loading}
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ================= SUBCOMPONENTES ================= */
function KpiCard({ label, value, icon, loading }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-50 p-3 shadow-sm border border-slate-100">{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        <div className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">
          {loading ? <Skeleton className="h-9 w-32" /> : value ?? "—"}
        </div>
      </div>
    </div>
  );
}

function Row({ name, value, desc, status, loading }: any) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-900">{name}</td>
      <td className="px-6 py-4 font-semibold text-slate-700">
        {loading ? <Skeleton className="h-5 w-16" /> : value}
      </td>
      <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{desc}</td>
      <td className="px-6 py-4 text-right">
        {!loading && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === "Healthy"
                ? "bg-green-100 text-green-800"
                : status === "Warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        )}
      </td>
    </tr>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

/* ================= HELPERS ================= */
function fmtMoney(n?: number) {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNumber(n?: number) {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("es-ES").format(n);
}



