"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  CalendarDaysIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon
} from "@heroicons/react/24/outline";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Asegúrate de tener esto o quita la función exportar si falla

/* ================= TIPOS ================= */
type Transaction = {
  id: number;
  user_id: number;
  user_email?: string; // Si tu backend lo envía
  amount: number;
  type: string;        // 'deposit', 'order', 'streaming', etc.
  status: string;      // 'approved', 'pending', 'rejected'
  note?: string;
  created_at: string;
};

/* ================= COMPONENTE PRINCIPAL ================= */
export default function ReportsTransactionsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Totales
  const totalAmount = useMemo(() => filteredData.reduce((acc, t) => acc + t.amount, 0), [filteredData]);
  const totalCount = filteredData.length;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";

  // 1. CARGA DE DATOS
  const fetchTransactions = useCallback(async () => {
    if (status === "loading") return;
    const token = (session as any)?.accessToken || (session?.user as any)?.token;
    if (!token) return;

    setLoading(true);
    try {
      // Pedimos las últimas 500 transacciones para tener data suficiente
      const res = await fetch(`${API_URL}/transactions?limit=500`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.items || []);
        setTransactions(list);
        setFilteredData(list); // Inicialmente mostramos todo
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  }, [status, session, API_URL]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 2. LÓGICA DE FILTRADO (Se ejecuta cuando cambias búsqueda o fechas)
  useEffect(() => {
    let result = transactions;

    // Filtro por Texto (ID, Nota, Tipo)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.note?.toLowerCase().includes(lower) || 
        t.type.toLowerCase().includes(lower) ||
        t.id.toString().includes(lower) ||
        t.user_email?.toLowerCase().includes(lower)
      );
    }

    // Filtro por Fechas
    if (startDate) {
      result = result.filter(t => new Date(t.created_at) >= new Date(startDate));
    }
    if (endDate) {
      // Ajustamos al final del día
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      result = result.filter(t => new Date(t.created_at) <= end);
    }

    setFilteredData(result);
  }, [searchTerm, startDate, endDate, transactions]);

  // 3. EXPORTAR A PDF (Opcional)
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Transacciones - Moto Store", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // @ts-ignore
    doc.autoTable({
      head: [['ID', 'Fecha', 'Tipo', 'Nota', 'Monto', 'Estado']],
      body: filteredData.map(t => [
        t.id, 
        new Date(t.created_at).toLocaleDateString(),
        t.type,
        t.note || "-",
        `$${t.amount.toFixed(2)}`,
        t.status
      ]),
      startY: 30,
    });
    doc.save("transacciones.pdf");
  };

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Historial de Transacciones</h1>
        <p className="text-slate-500 font-medium">Auditoría detallada de movimientos financieros.</p>
      </div>

      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
        
        {/* Filtros Izquierda */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Buscar ID, Cliente, Nota..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 w-full sm:w-64 focus:outline-none focus:border-[#E33127]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Fechas */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 sm:w-auto"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 sm:w-auto"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Botones Derecha */}
        <div className="flex gap-2">
           <button onClick={fetchTransactions} className="p-2 text-slate-500 hover:text-[#E33127] bg-slate-50 rounded-lg transition-colors" title="Refrescar">
             <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-[#E33127] transition-all">
             <ArrowDownTrayIcon className="w-4 h-4" /> Exportar
           </button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN (Dinámicas según filtro) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Movimiento</p>
              <p className="text-2xl font-black text-emerald-800">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
           </div>
           <BanknotesIcon className="w-8 h-8 text-emerald-300" />
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operaciones</p>
              <p className="text-2xl font-black text-slate-700">{totalCount}</p>
           </div>
           <FunnelIcon className="w-8 h-8 text-slate-300" />
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Detalle / Nota</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">Cargando datos...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">No hay transacciones que coincidan con tu búsqueda.</td></tr>
              ) : (
                filteredData.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{t.id}</td>
                    
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(t.created_at).toLocaleDateString("es-VE", { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="block text-[10px] text-slate-400">{new Date(t.created_at).toLocaleTimeString()}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{t.note || "Sin detalle"}</div>
                      {t.user_id && <div className="text-[10px] text-slate-400">User ID: {t.user_id}</div>}
                    </td>

                    <td className="px-6 py-4 text-center">
                       <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                         {t.type}
                       </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={t.status} />
                    </td>

                    <td className={`px-6 py-4 text-right font-black ${t.amount >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                       {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* ================= COMPONENTE AUXILIAR ================= */
function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === 'approved' || s === 'completed') {
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase"><CheckCircleIcon className="w-3 h-3"/> Exitoso</span>;
  }
  if (s === 'pending' || s === 'processing') {
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase"><ClockIcon className="w-3 h-3"/> Pendiente</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase"><XCircleIcon className="w-3 h-3"/> Fallido</span>;
}


