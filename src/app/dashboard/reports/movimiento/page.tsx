"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";

/* ================= TIPOS ================= */
type Movimiento = {
  id: string | number;
  fecha: string;
  tipo: string;
  usuario: string;
  monto: number;
  estado: string;
};

/* ================= ICONOS ================= */
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

/* ================= CONFIG ================= */
function getApiBaseRaw(): string {
  const base =
    (process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_FULL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "").trim();

  return base.replace(/\/+$/, "");
}

function getApiBaseCandidates(): string[] {
  const base = getApiBaseRaw();
  if (!base) return [];
  if (base.endsWith("/api/v1")) return [base];
  return [base, `${base}/api/v1`];
}

// ✅ PROBAMOS MUCHAS RUTAS COMUNES
const MOVEMENTS_PATHS = [
  // Español
  "/reports/movimiento",
  "/reports/movimientos",

  // Inglés
  "/reports/movement",
  "/reports/movements",
  "/reports/transaction",
  "/reports/transactions",
];

const REFRESH_MS = 30_000;
const DEBOUNCE_MS = 400;

export default function ReportsMovimientosPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Movimiento[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setQDebounced(q.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [q]);

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      if (status === "loading") return;

      const bases = getApiBaseCandidates();
      if (bases.length === 0) {
        throw new Error(
          "Falta la URL del backend: configura NEXT_PUBLIC_API_BASE_URL (o NEXT_PUBLIC_API_FULL) en Vercel."
        );
      }

      if (!token) {
        throw new Error("No hay sesión o token. Inicia sesión como ADMIN/SUPERUSER.");
      }

      const params = new URLSearchParams();
      if (qDebounced) params.set("q", qDebounced);

      const triedUrls: string[] = [];

      // probamos base + path con y sin slash final
      for (const base of bases) {
        for (const p of MOVEMENTS_PATHS) {
          for (const withSlash of [false, true]) {
            const path = withSlash ? `${p}/` : p;
            const url = `${base}${path}${params.toString() ? `?${params.toString()}` : ""}`;
            triedUrls.push(url);

            const res = await fetch(url, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            });

            if (res.ok) {
              const json = await res.json();

              const items: any[] = Array.isArray(json)
                ? json
                : Array.isArray(json?.items)
                ? json.items
                : [];

              const normalized: Movimiento[] = items.map((it: any, idx: number) => ({
                id: it?.id ?? it?._id ?? it?.uuid ?? idx,
                fecha: String(it?.fecha ?? it?.date ?? it?.createdAt ?? ""),
                tipo: String(it?.tipo ?? it?.type ?? ""),
                usuario: String(it?.usuario ?? it?.user ?? it?.username ?? ""),
                monto: Number(it?.monto ?? it?.amount ?? 0),
                estado: String(it?.estado ?? it?.status ?? ""),
              }));

              setRows(normalized);
              setLastUpdated(new Date());
              return;
            }

            if (res.status === 401) throw new Error("Sesión expirada (401). Vuelve a iniciar sesión.");
            if (res.status === 403) throw new Error("Acceso denegado (403). Solo Admin/Superuser.");

            // si 404, seguimos intentando otras rutas
          }
        }
      }

      // si nada funcionó
      throw new Error(
        `Backend respondió 404 (Not Found). Ninguna ruta coincide.\n\nRutas probadas:\n- ${triedUrls
          .slice(0, 10)
          .join("\n- ")}\n${triedUrls.length > 10 ? "\n..." : ""}`
      );
    } catch (e: any) {
      console.error(e);
      setRows([]);
      setErr(e?.message ?? "No se pudo cargar movimientos");
    } finally {
      setLoading(false);
    }
  }, [status, token, qDebounced]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [status, fetchData]);

  useEffect(() => {
    if (status === "loading") return;
    const id = window.setInterval(() => fetchData(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [status, fetchData]);

  const filtered = useMemo(() => {
    const w = qDebounced.toLowerCase();
    if (!w) return rows;
    return rows.filter((r) => {
      return (
        r.tipo.toLowerCase().includes(w) ||
        r.usuario.toLowerCase().includes(w) ||
        String(r.monto).toLowerCase().includes(w) ||
        r.estado.toLowerCase().includes(w) ||
        r.fecha.toLowerCase().includes(w)
      );
    });
  }, [rows, qDebounced]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(Number(n || 0));

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Movimientos", 20, 18);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 26);
    if (qDebounced) doc.text(`Filtro: ${qDebounced}`, 20, 32);

    let y = qDebounced ? 40 : 36;

    doc.setFontSize(11);
    doc.text("ID", 20, y);
    doc.text("Fecha", 40, y);
    doc.text("Tipo", 92, y);
    doc.text("Usuario", 122, y);
    doc.text("Monto", 160, y);
    doc.text("Estado", 182, y);

    y += 6;
    doc.setLineWidth(0.2);
    doc.line(20, y, 200, y);
    y += 6;

    doc.setFontSize(10);

    const pageBottom = 285;
    const safe = (s: any) => String(s ?? "").slice(0, 22);
    const safeWide = (s: any) => String(s ?? "").slice(0, 30);

    const list = filtered.slice(0, 200);

    for (const r of list) {
      if (y > pageBottom) {
        doc.addPage();
        y = 20;
      }
      doc.text(safe(r.id), 20, y);
      doc.text(safeWide(r.fecha), 40, y);
      doc.text(safe(r.tipo), 92, y);
      doc.text(safe(r.usuario), 122, y);
      doc.text(safe(fmtMoney(r.monto)), 160, y);
      doc.text(safe(r.estado), 182, y);
      y += 7;
    }

    doc.save("reporte_movimientos.pdf");
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[#E33127]">
            Movimientos
          </h1>
          <p className="text-sm text-slate-600">
            Listado de operaciones del período.
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-400">Actualizado: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33127]"
            placeholder="Buscar… (tipo, usuario, estado, fecha)"
          />

          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium hover:bg-slate-50"
            onClick={() => setQ("")}
          >
            Limpiar
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 justify-center"
            onClick={fetchData}
            disabled={loading}
          >
            <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando…" : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={generatePDF}
            disabled={loading || filtered.length === 0}
            className="px-4 py-2 rounded-lg bg-[#E33127] text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            <IconDownload className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </header>

      {err && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </pre>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3 text-left">ID</th>
              <th className="px-3 py-3 text-left">Fecha</th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">Usuario</th>
              <th className="px-3 py-3 text-right">Monto (USD)</th>
              <th className="px-3 py-3 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Sin datos.
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr key={String(r.id)} className="border-t border-slate-100">
                <td className="px-3 py-2">{String(r.id)}</td>
                <td className="px-3 py-2">{r.fecha || "—"}</td>
                <td className="px-3 py-2">{r.tipo || "—"}</td>
                <td className="px-3 py-2">{r.usuario || "—"}</td>
                <td className="px-3 py-2 text-right">{fmtMoney(r.monto)}</td>
                <td className="px-3 py-2">
                  <EstadoChip estado={r.estado || "—"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400">
        Auto-refresh: cada {Math.round(REFRESH_MS / 1000)} segundos.
      </div>
    </div>
  );
}

function EstadoChip({ estado }: { estado: string }) {
  const st = estado.toLowerCase();
  let cls = "bg-slate-100 text-slate-700";
  if (st.includes("complet") || st.includes("paid") || st.includes("success")) cls = "bg-emerald-50 text-emerald-700";
  else if (st.includes("pend") || st.includes("wait")) cls = "bg-amber-50 text-amber-700";
  else if (st.includes("anul") || st.includes("cancel") || st.includes("fail")) cls = "bg-red-50 text-red-700";

  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{estado}</span>;
}




