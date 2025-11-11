// src/app/dashboard/reports/utilidades/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Fila = {
  id: string | number;
  rol: string;         // ADMIN / DISTRIBUTOR / TAQUILLA / CLIENT
  usuario: string;     // nombre o username
  total: number;       // utilidades en $ o %
};

export default function ReportsUtilidadesPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Fila[]>([]);
  const [rol, setRol] = useState<string>("ALL");
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    const go = async () => {
      setLoading(true);
      try {
        // TODO: Reemplaza por tu endpoint real con filtros de rol/q
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/reports/utilities?rol=${rol}&q=${q}`);
        // const json = await res.json();
        // setRows(json?.items ?? []);
        // DEMO:
        setTimeout(
          () =>
            setRows([
              { id: 1, rol: "ADMIN",        usuario: "superadmin", total: 1200.35 },
              { id: 2, rol: "DISTRIBUTOR",  usuario: "distribu01", total: 830.0 },
              { id: 3, rol: "TAQUILLA",     usuario: "taquilla11", total: 420.5 },
              { id: 4, rol: "CLIENT",       usuario: "cliente77",  total: 50.0 },
            ]),
          350
        );
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [rol, q]);

  const filtered = useMemo(() => {
    let data = [...rows];
    if (rol !== "ALL") data = data.filter((r) => r.rol === rol);
    if (q.trim()) {
      const w = q.trim().toLowerCase();
      data = data.filter((r) => r.usuario.toLowerCase().includes(w));
    }
    return data;
  }, [rows, rol, q]);

  const totalGeneral = filtered.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
            Utilidades
          </h1>
          <p className="text-sm text-slate-600">Distribución de utilidades por rol/usuario.</p>
        </div>

        <div className="flex items-center gap-2">
          <select className="select" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            <option value="TAQUILLA">TAQUILLA</option>
            <option value="CLIENT">CLIENT</option>
          </select>
          <input
            className="input w-48"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar usuario…"
          />
        </div>
      </header>

      {/* Resumen */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Box label="Registros" value={String(filtered.length)} loading={loading} />
        <Box
          label="Utilidades (USD)"
          value={new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(totalGeneral)}
          loading={loading}
        />
        <Box label="Rol filtrado" value={rol === "ALL" ? "Todos" : rol} loading={loading} />
      </section>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-right">Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                  Sin datos.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={String(r.id)} className="border-t">
                <td className="px-3 py-2">{r.rol}</td>
                <td className="px-3 py-2">{r.usuario}</td>
                <td className="px-3 py-2 text-right">
                  {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(r.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Box({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {loading ? <span className="animate-pulse text-slate-300">•••</span> : value}
      </div>
    </div>
  );
}
