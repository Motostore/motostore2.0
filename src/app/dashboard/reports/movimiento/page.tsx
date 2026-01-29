"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

/* ================= CONFIGURACIÓN ================= */

// 1. Usamos la variable de entorno para consistencia
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";

// 2. Endpoint correcto (Verifica si en tu backend es /transactions o /reports/transactions)
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
  created_at: string; 
  type: string;
  amount: number;
  status: string;
  reference?: string;
  user_email?: string; 
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

  // Función de Carga
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
        // Construcción limpia de la URL
        const url = `${API_BASE}${ENDPOINT_PATH}`;
        
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Sesión expirada. Recarga la página.");
          if (res.status === 403) throw new Error("Acceso denegado.");
          if (res.status === 404) throw new Error(`Ruta no encontrada: ${ENDPOINT_PATH}`);
          throw new Error(`Error ${res.status}: No se pudieron cargar los datos.`);
        }

        const json = await res.json();
        
        // Normalización Robusta
        const items = Array.isArray(json) ? json : json.data || json.items || [];
        
        const normalized: Transaction[] = items.map((item: any) => ({
          id: item.id || item._id,
          created_at: item.created_at || item.createdAt || item.date || new Date().toISOString(),
          type: item.type || item.tipo || "GENERAL",
          amount: Number(item.amount || item.monto || 0),
          status: item.status || item.estado || "PENDING",
          reference: item.reference || item.ref || "-",
          user_email: item.user_email || item.email || item.user?.email,
          description: item.description || item.desc || item.note,
        }));

        // Ordenar: Más recientes primero
        normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setRows(normalized);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Error desconocido");
          setRows([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [status, token]
  );

  // Efectos
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || error) return;
    const interval = setInterval(() => fetchData({ silent: true }), REFRESH_MS);
    return () => clearInterval(interval);
  }, [status, fetchData, error]);

  // Filtrado
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lower = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.type.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower) ||
        (r.reference && r.reference.toLowerCase().includes(lower)) ||
        (r.user_email && r.user_email.toLowerCase().includes(lower)) ||
        r.id.toString().includes(lower)
    );
  }, [rows, searchTerm]);

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(227, 49, 39);
    doc.rect(0, 0, 210, 20, 'F'); // Barra roja superior
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Movimientos - Moto Store", 14, 13);
    
    // Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 30);
    if (searchTerm) doc.text(`Filtro: "${searchTerm}"`, 14, 35);

    const tableBody = filteredRows.map((row) => [
      formatDate(row.created_at),
      row.reference || row.id,
      row.user_email || "N/A",
      row.type,
      formatCurrency(row.amount),
      row.status,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Fecha", "Referencia", "Usuario", "Tipo", "Monto", "Estado"]],
      body: tableBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] }, // Slate-800
      alternateRowStyles: { fillColor: [241, 245, 249] }, // Slate-50
    });

    doc.save(`movimientos_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  /* ================= VISTA ================= */

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-4">
             <div className="bg-slate-100 p-3 rounded-2xl">
                <BanknotesIcon className="w-8 h-8 text-slate-600"/>
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Movimientos</h1>
                <p className="text-slate-500 font-medium">Historial detallado de transacciones.</p>
             </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm font-bold text-slate-700 focus:border-[#E33127] focus:ring-1 focus:ring-[#E33127] sm:w-64"
            />
          </div>

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#E33127] disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={generatePDF}
            disabled={filteredRows.length === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#E33127] px-4 text-sm font-bold text-white shadow-md shadow-red-100 transition-transform hover:bg-red-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 flex items-center gap-3 font-bold text-sm">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TABLA */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Ref / Descripción</th>
                {rows.some(r => r.user_email) && <th className="px-6 py-4">Usuario</th>}
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    <div className="flex justify-center mb-2"><ArrowPathIcon className="w-6 h-6 animate-spin text-slate-300"/></div>
                    Cargando movimientos...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCardIcon className="w-8 h-8 opacity-20" />
                      <p className="font-medium">No se encontraron movimientos.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-700">{formatDate(row.created_at).split(',')[0]}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(row.created_at).split(',')[1]}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-500">{row.reference || row.id}</span>
                            {row.description && <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.description}</span>}
                        </div>
                    </td>

                    {rows.some(r => r.user_email) && (
                      <td className="px-6 py-4">
                         <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                           {row.user_email?.split('@')[0]}
                         </span>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {row.type}
                      </span>
                    </td>

                    <td className={`px-6 py-4 text-right font-black ${
                      ['DEPOSIT', 'INGRESO', 'PROFIT'].includes(row.type.toUpperCase()) ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {['DEPOSIT', 'INGRESO', 'PROFIT'].includes(row.type.toUpperCase()) ? '+' : ''}{formatCurrency(row.amount)}
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
        
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
          <span>{filteredRows.length} Registros</span>
          {lastUpdated && <span>Sync: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTE DE ESTADO ================= */

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  
  if (s === 'COMPLETED' || s === 'APPROVED' || s === 'SUCCESS' || s === 'EXITOSO') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black">EXITOSO</span>;
  }
  if (s === 'PENDING' || s === 'PROCESSING' || s === 'WAITING') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black">PENDIENTE</span>;
  }
  if (s === 'FAILED' || s === 'REJECTED' || s === 'CANCELED') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 text-[10px] font-black">FALLIDO</span>;
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black">
      {status}
    </span>
  );
}


