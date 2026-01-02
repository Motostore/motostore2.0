"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/* ================= CONFIG ================= */
function getApiBase(): string {
  const base =
    (process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_FULL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "http://127.0.0.1:8000/api/v1"
    ).trim();

  return base.replace(/\/+$/, "");
}

const UTILITIES_PATH = "/reports/utilities";
const REFRESH_MS = 30_000;

/* ================= TIPOS ================= */
type UtilitiesData = {
  total_income: number;
  total_withdrawn: number;
  net_system_balance: number;
};

/* ================= ICONO PDF (SVG SIMPLE) ================= */
function IconDownload(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}

export default function UtilidadesPage() {
  const { data: session, status } = useSession();

  const [data, setData] = useState<UtilitiesData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const token = useMemo(() => {
    if (!session) return null;
    return (
      (session as any).accessToken ||
      (session as any).token ||
      (session as any).user?.token ||
      (session as any).user?.accessToken ||
      null
    );
  }, [session]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

  const fetchData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (status === "loading") return;

      if (!token) {
        if (status === "authenticated") setError("No se encontró token de seguridad.");
        setInitialLoading(false);
        return;
      }

      if (refreshing) return;

      const hasData = !!data;
      if (!hasData) setInitialLoading(true);
      if (hasData) setRefreshing(true);

      if (!opts?.silent) setError("");

      try {
        const API_BASE = getApiBase();

        const res = await fetch(`${API_BASE}${UTILITIES_PATH}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          if (res.status === 403) throw new Error("Acceso Denegado: Solo Admin/Superuser.");
          if (res.status === 401) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
          throw new Error(
            `Error al conectar con el servidor (${res.status}). ${txt ? txt.slice(0, 200) : ""}`.trim()
          );
        }

        const json = (await res.json()) as any;

        const normalized: UtilitiesData = {
          total_income: Number(json?.total_income ?? 0),
          total_withdrawn: Number(json?.total_withdrawn ?? 0),
          net_system_balance: Number(json?.net_system_balance ?? 0),
        };

        if (!mountedRef.current) return;

        setData(normalized);
        setLastUpdated(new Date());
      } catch (e: any) {
        if (!mountedRef.current) return;
        setError(e?.message || "Error desconocido");
      } finally {
        if (!mountedRef.current) return;
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [status, token, data, refreshing]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (status === "loading") return;

    const id = window.setInterval(() => {
      fetchData({ silent: true });
    }, REFRESH_MS);

    return () => window.clearInterval(id);
  }, [status, fetchData]);

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Utilidades y Caja", 20, 18);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 26);
    if (lastUpdated) doc.text(`Última actualización: ${lastUpdated.toLocaleTimeString()}`, 20, 32);

    doc.setFontSize(12);
    doc.text(`Ingresos Totales: ${fmtMoney(data.total_income)}`, 20, 48);
    doc.text(`Egresos Totales: ${fmtMoney(data.total_withdrawn)}`, 20, 58);
    doc.text(`Dinero en Sistema (Pasivo): ${fmtMoney(data.net_system_balance)}`, 20, 68);

    doc.setFontSize(10);
    doc.text(
      "Este reporte se genera en tiempo real basándose en transacciones DEPOSIT (Ingreso) y WITHDRAW (Egreso).",
      20,
      85,
      { maxWidth: 170 }
    );

    doc.save("reporte_utilidades.pdf");
  };

  if (initialLoading && !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-slate-400 gap-2 animate-pulse">
        <PresentationChartLineIcon className="w-8 h-8 text-[#E33127] animate-bounce" />
        <span className="font-bold text-lg">Calculando finanzas...</span>
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-red-700">No se pudo cargar el reporte</h2>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => fetchData()}
          className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-3 text-xs text-slate-400">
        Auto-refresh: cada {Math.round(REFRESH_MS / 1000)} segundos.
        {lastUpdated && <span className="ml-2">Última actualización: {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
            <PresentationChartLineIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Utilidades y Caja</h1>
            <p className="text-slate-500 font-medium text-sm">Flujo de efectivo global del sistema.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="group p-3 hover:bg-slate-50 rounded-full text-slate-400 hover:text-[#E33127] transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
            title="Actualizar datos"
            disabled={refreshing}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>

          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#E33127] rounded-xl hover:bg-red-700 transition-opacity shadow-md shadow-red-200 disabled:opacity-50"
            title="Exportar PDF"
            disabled={refreshing}
          >
            <IconDownload className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* TARJETAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. INGRESOS */}
        <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowTrendingUpIcon className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-emerald-600 font-bold uppercase tracking-wider text-xs">
            <span className="p-1.5 bg-emerald-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </span>
            Ingresos Totales
          </div>
          <p className="text-4xl font-black text-slate-900 mb-1">{fmtMoney(data.total_income)}</p>
          <p className="text-sm text-slate-400 font-medium">Depósitos aprobados históricamente</p>
        </div>

        {/* 2. EGRESOS */}
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl shadow-red-500/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownIcon className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-red-600 font-bold uppercase tracking-wider text-xs">
            <span className="p-1.5 bg-red-100 rounded-lg">
              <ArrowDownIcon className="w-4 h-4" />
            </span>
            Egresos Totales
          </div>
          <p className="text-4xl font-black text-slate-900 mb-1">{fmtMoney(data.total_withdrawn)}</p>
          <p className="text-sm text-slate-400 font-medium">Dinero retirado por usuarios</p>
        </div>

        {/* 3. NETO (AHORA EN VERDE COMO INGRESOS) */}
        <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors"></div>

          <div className="flex items-center gap-3 mb-4 font-bold uppercase tracking-wider text-xs relative z-10 text-emerald-600">
            <span className="p-1.5 rounded-lg bg-emerald-100 border border-emerald-100">
              <BanknotesIcon className="w-4 h-4 text-emerald-600" />
            </span>
            Dinero en Sistema (Pasivo)
          </div>

          <p className="text-4xl font-black mb-1 relative z-10 text-slate-900 tracking-tight">
            {fmtMoney(data.net_system_balance)}
          </p>

          <p className="text-sm text-slate-400 font-medium relative z-10">
            Saldo vivo en billeteras de usuarios
          </p>
        </div>
      </div>

      {/* NOTA */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs font-medium flex gap-3 items-center shadow-sm">
        <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm">INFO</span>
        <p>
          Este reporte se genera en tiempo real basándose en todas las transacciones de tipo <b>DEPOSIT</b> (Ingreso) y{" "}
          <b>WITHDRAW</b> (Egreso) registradas en la base de datos.
        </p>
      </div>
    </div>
  );
}





