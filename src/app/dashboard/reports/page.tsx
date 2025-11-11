// src/app/dashboard/reports/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReportsIndexPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
            Reportes
          </h1>
          <p className="text-sm text-slate-600">Resumen y accesos directos a los reportes.</p>
        </div>

        {/* Filtro de rango de fechas (placeholder) */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="Desde"
          />
          <span className="text-slate-500">—</span>
          <input
            type="date"
            className="input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="Hasta"
          />
          <button
            className="btn btn-primary"
            onClick={() => alert(`Aplicar filtro\nDesde: ${from || "-"}\nHasta: ${to || "-"}`)}
          >
            Aplicar
          </button>
        </div>
      </header>

      {/* Accesos rápidos a secciones */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardLink
          title="General"
          desc="Indicadores principales y totales del período."
          href="/dashboard/reports/general"
        />
        <CardLink
          title="Movimientos"
          desc="Listado de operaciones y cambios por día."
          href="/dashboard/reports/movimiento"
        />
        <CardLink
          title="Utilidades"
          desc="Resumen de utilidades por rol/usuario."
          href="/dashboard/reports/utilidades"
        />
      </section>
    </div>
  );
}

function CardLink({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition"
    >
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">{desc}</div>
      <div className="mt-3 text-sm font-medium text-[var(--brand)]">Ver detalles →</div>
    </Link>
  );
}
