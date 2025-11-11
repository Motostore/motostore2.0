// src/app/dashboard/reports/movimiento/page.tsx
"use client";

import { useEffect, useState } from "react";

type Movimiento = {
  id: string | number;
  fecha: string;         // ISO o legible
  tipo: string;          // Venta / Compra / Retiro / etc
  usuario: string;
  monto: number;
  estado: string;        // Completado / Pendiente / Anulado...
};

export default function ReportsMovimientosPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Movimiento[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const go = async () => {
      try {
        setLoading(true);
        setErr(null);
        // TODO: Reemplaza por tu endpoint real con filtros (q, fechas, paginado…)
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/reports/movements?q=${encodeURIComponent(q)}`);
        // const json = await res.json();
        // setRows(json?.items ?? []);
        // DEMO:
        setTimeout(
          () =>
            setRows([
              { id: 1, fecha: "2025-09-01 10:22", tipo: "Venta", usuario: "jdoe", monto: 120.5, estado: "Completado" },
              { id: 2, fecha: "2025-09-01 12:05", tipo: "Compra", usuario: "alice", monto: 80.0, estado: "Completado" },
              { id: 3, fecha: "2025-09-02 08:41", tipo: "Retiro", usuario: "bob", monto: 50.0, estado: "Pendiente" },
            ]),
          350
        );
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar movimientos");
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [q]);

  const filtered = rows.filter((r) => {
    const w = q.trim().toLowerCase();
    if (!w) return true;
    return (
      r.tipo.toLowerCase().includes(w) ||
      r.usuario.toLowerCase().includes(w) ||
      String(r.monto).toLowerCase().includes(w) ||
      r.estado.toLowerCase().includes(w) ||
      r.fecha.toLowerCase().includes(w)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
            Movimientos
          </h1>
          <p className="text-sm text-slate-600">Listado de operaciones del período.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input w-56"
            placeholder="Buscar…"
          />
          <button className="btn btn-ghost" onClick={() => setQ("")}>
            Limpiar
          </button>
        </div>
      </header>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-right">Monto (USD)</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Sin datos.
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr key={String(r.id)} className="border-t">
                <td className="px-3 py-2">{String(r.id)}</td>
                <td className="px-3 py-2">{r.fecha}</td>
                <td className="px-3 py-2">{r.tipo}</td>
                <td className="px-3 py-2">{r.usuario}</td>
                <td className="px-3 py-2 text-right">
                  {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(r.monto)}
                </td>
                <td className="px-3 py-2">
                  <EstadoChip estado={r.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* paginación (placeholder) */}
      <div className="flex justify-center">
        <button className="btn btn-ghost" onClick={() => alert("Cargar más (demo)")}>
          Cargar más
        </button>
      </div>
    </div>
  );
}

function EstadoChip({ estado }: { estado: string }) {
  const st = estado.toLowerCase();
  let cls = "bg-gray-100 text-gray-700";
  if (st.includes("complet")) cls = "bg-emerald-50 text-emerald-700";
  else if (st.includes("pend")) cls = "bg-amber-50 text-amber-700";
  else if (st.includes("anul") || st.includes("cancel")) cls = "bg-red-50 text-red-700";

  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{estado}</span>;
}
