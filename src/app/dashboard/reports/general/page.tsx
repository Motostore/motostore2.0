// src/app/dashboard/reports/general/page.tsx
"use client";

import { useEffect, useState } from "react";

type Totales = {
  ventas: number;
  compras: number;
  utilidades: number;
  usuariosActivos: number;
};

export default function ReportsGeneralPage() {
  const [loading, setLoading] = useState(false);
  const [totales, setTotales] = useState<Totales | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const go = async () => {
      try {
        setLoading(true);
        setErr(null);
        // TODO: Reemplaza por tu endpoint real
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/reports/general`);
        // const json = await res.json();
        // setTotales(json);
        // DEMO:
        setTimeout(
          () =>
            setTotales({
              ventas: 15230.45,
              compras: 11780.0,
              utilidades: 3450.45,
              usuariosActivos: 82,
            }),
          350
        );
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar el reporte general");
      } finally {
        setLoading(false);
      }
    };
    go();
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
          Reporte General
        </h1>
        <p className="text-sm text-slate-600">Indicadores principales del período seleccionado.</p>
      </header>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Ventas (USD)" value={fmtMoney(totales?.ventas)} loading={loading} />
        <KpiCard label="Compras (USD)" value={fmtMoney(totales?.compras)} loading={loading} />
        <KpiCard label="Utilidades (USD)" value={fmtMoney(totales?.utilidades)} loading={loading} />
        <KpiCard label="Usuarios activos" value={fmtNumber(totales?.usuariosActivos)} loading={loading} />
      </section>

      {/* Tabla rápida (placeholder) */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Métrica</th>
              <th className="px-3 py-2 text-left">Valor</th>
              <th className="px-3 py-2 text-left">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <Row name="Ticket promedio" value="$ 27,30" desc="Venta promedio por operación." loading={loading}/>
            <Row name="Órdenes" value="564" desc="Cantidad de órdenes en el período." loading={loading}/>
            <Row name="Tasa conversión" value="3,1%" desc="Relación visitas/ventas." loading={loading}/>
          </tbody>
        </table>
      </section>
    </div>
  );
}

function KpiCard({ label, value, loading }: { label: string; value?: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {loading ? <span className="animate-pulse text-slate-300">•••</span> : value ?? "—"}
      </div>
    </div>
  );
}

function Row({ name, value, desc, loading }: { name: string; value: string; desc: string; loading?: boolean }) {
  return (
    <tr className="border-t">
      <td className="px-3 py-2">{name}</td>
      <td className="px-3 py-2">{loading ? "…" : value}</td>
      <td className="px-3 py-2 text-slate-600">{desc}</td>
    </tr>
  );
}

function fmtMoney(n?: number) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);
}
function fmtNumber(n?: number) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat("es-ES").format(n);
}
