"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Asegúrate de tenerlo instalado
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

/* ================= CONFIGURACIÓN ================= */

// 1. Conexión Directa a Render
const API_BASE = "https://motostore-api.onrender.com/api/v1";

// NOTA: Ajusta esto si tu endpoint en backend se llama distinto (ej: /movements, /history)
const ENDPOINT_PATH = "/transactions"; 
const REFRESH_MS = 30_000;

/* ================= UTILS ================= */
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
interface Transaction {
  id: string | number;
  created_at: string; // O 'fecha'
  type: string;
  amount: number;
  status: string;
  reference?: string;
  user_email?: string; // Para identificar de quién es el movimiento (Admin)
  description?: string;
}

interface ExtendedUser {
  accessToken?: string;
  token?: string;
  role?: string;
}

/* ================= COMPONENTE PRINCIPAL ================= */
export default function ReportsMovimientosPage() {
  const { data: session, status } = useSession();

  // Estados
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Obtener Token y Rol
  const { token, role } = useMemo(() => {
    if (!session?.user) return { token: null, role: null };
    const user = session.user as ExtendedUser;
    return {
      token: user.accessToken || user.token || (session as any).accessToken || null,
      role: user.role || "user",
    };
  }, [session]);

  // Función de Carga (Optimizada con AbortController)
  const fetchData = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (status === "loading") return;

      if (!token) {
        if (status === "authenticated") setError("No se encontró token de sesión.");
        setLoading(false);
        return;
      }

      const controller = new AbortController();

      if (!opts.silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetch(`${API_BASE}${ENDPOINT_PATH}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Sesión expirada.");
          if (res.status === 403) throw new Error("Sin permisos de acceso.");
          throw new Error(`Error ${res.status}: No se pudieron cargar los movimientos.`);
        }

        const json = await res.json();
        
        // Normalización de datos (Soporta varios formatos de respuesta)
        const items = Array.isArray(json) ? json : json.data || json.items || [];
        
        const normalized: Transaction[] = items.map((item: any) => ({
          id: item.id || item._id,
          created_at: item.created_at || item.createdAt || item.date || new Date().toISOString(),
          type: item.type || item.tipo || "UNKNOWN",
          amount: Number(item.amount || item.monto || 0),
          status: item.status || item.estado || "PENDING",
          reference: item.reference || item.ref,
          user_email: item.user_email || item.email || item.user?.email,
          description: item.description || item.desc,
        }));

        // Ordenar por fecha (más reciente primero)
        normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setRows(normalized);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error desconocido");
          setRows([]);
        }
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    },
    [status, token]
  );

  // Efectos
  useEffect(() => {
    const cancel = fetchData();
    return () => { if (typeof cancel === 'function') cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || error) return;
    const interval = setInterval(() => fetchData({ silent: true }), REFRESH_MS);
    return () => clearInterval(interval);
  }, [status, fetchData, error]);

  // Filtrado en Cliente (Rápido y eficiente)
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lower = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.type.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower) ||
        r.reference?.toLowerCase().includes(lower) ||
        r.user_email?.toLowerCase().includes(lower) ||
        r.id.toString().includes(lower)
    );
  }, [rows, searchTerm]);

  // Generar PDF Profesional
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header PDF
    doc.setFontSize(18);
    doc.text("Reporte de Movimientos", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
    if (searchTerm) doc.text(`Filtro aplicado: "${searchTerm}"`, 14, 34);

    // Datos para la tabla
    const tableBody = filteredRows.map((row) => [
      formatDate(row.created_at),
      row.reference || row.id,
      row.user_email || "N/A", // Solo útil para Admin
      row.type,
      formatCurrency(row.amount),
      row.status,
    ]);

    // Tabla Automática
    (doc as any).autoTable({
      startY: searchTerm ? 40 : 35,
      head: [["Fecha", "Ref/ID", "Usuario", "Tipo", "Monto", "Estado"]],
      body: tableBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [227, 49, 39] }, // Rojo Motostore
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`movimientos_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  /* ================= RENDERS ================= */

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black text-[#E33127]">Movimientos</h1>
          <p className="text-slate-500">
            {role === 'admin' || role === 'superuser' 
              ? "Transacciones globales de todos los usuarios." 
              : "Historial de tus recargas y compras."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar referencia, usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm focus:border-[#E33127] focus:ring-1 focus:ring-[#E33127] sm:w-64"
            />
          </div>

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#E33127] disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={generatePDF}
            disabled={filteredRows.length === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#E33127] px-4 text-sm font-bold text-white shadow-md shadow-red-100 transition-transform hover:bg-red-700 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 flex items-center gap-3">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* TABLA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Referencia</th>
                {/* Mostrar columna Usuario si hay datos (Admin) */}
                {rows.some(r => r.user_email) && <th className="px-6 py-4">Usuario</th>}
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                       <ArrowPathIcon className="w-6 h-6 animate-spin text-[#E33127]" />
                    </div>
                    Cargando movimientos...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCardIcon className="w-8 h-8 opacity-20" />
                      <p>No se encontraron movimientos.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{formatDate(row.created_at).split(',')[0]}</div>
                      <div className="text-xs text-slate-400">{formatDate(row.created_at).split(',')[1]}</div>
                    </td>
                    
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {row.reference || row.id}
                    </td>

                    {/* Columna Condicional de Usuario */}
                    {rows.some(r => r.user_email) && (
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {row.user_email || "-"}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <span className="font-bold text-xs uppercase text-slate-700">
                        {row.type}
                      </span>
                      {row.description && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.description}</div>}
                    </td>

                    <td className={`px-6 py-4 font-bold ${
                      row.type === 'DEPOSIT' || row.type === 'INGRESO' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {row.type === 'DEPOSIT' ? '+' : ''}{formatCurrency(row.amount)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
          <span>Total: {filteredRows.length} movimientos</span>
          {lastUpdated && <span>Actualizado: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTES ================= */

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let style = "bg-slate-100 text-slate-600 border-slate-200"; // Default

  if (s.includes("success") || s.includes("aprob") || s.includes("complet")) {
    style = "bg-emerald-50 text-emerald-600 border-emerald-100";
  } else if (s.includes("pend") || s.includes("wait")) {
    style = "bg-amber-50 text-amber-600 border-amber-100";
  } else if (s.includes("fail") || s.includes("rechaz") || s.includes("cancel")) {
    style = "bg-red-50 text-red-600 border-red-100";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${style}`}>
      {status}
    </span>
  );
}



