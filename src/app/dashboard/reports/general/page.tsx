"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

/* ================= TIPOS ================= */
type ReportData = {
  ventas: number;
  compras: number;
  utilidades: number; // Esto será (Ventas - Costos)
  usuariosActivos: number;
  ticketPromedio: number;
  totalOrdenes: number;
  tasaConversion: number;
};

/* ================= HELPERS DE FECHA ================= */
const getDateRange = (type: 'today' | 'month' | 'all') => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (type === 'today') {
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
    } else if (type === 'month') {
        start.setDate(1); // Primer día del mes
        start.setHours(0,0,0,0);
        // End ya es hoy
    } else {
        // All time: Dejamos fechas vacías o muy antiguas
        return { start: "", end: "" }; 
    }
    return { 
        start: start.toISOString().split('T')[0], 
        end: end.toISOString().split('T')[0] 
    };
};

/* ================= ICONOS CUSTOM (SVG) ================= */
function IconDollar(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 1v22" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 5H10a3 3 0 000 6h4a3 3 0 010 6H7" /></svg>; }
function IconCart(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-2 9H7L6 6Z" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" /><circle cx="9" cy="21" r="1" /><circle cx="17" cy="21" r="1" /></svg>; }
function IconTrend(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 7h7v7" /></svg>; }
function IconUsers(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" /></svg>; }

const fmtMoney = (n?: number) => n === undefined ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtNumber = (n?: number) => n === undefined ? "—" : new Intl.NumberFormat("es-ES").format(n);

export default function ReportsGeneralPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ESTADO DE FILTROS
  const [filterType, setFilterType] = useState<'today' | 'month' | 'custom' | 'all'>('month');
  const [dateFrom, setDateFrom] = useState(getDateRange('month').start as string);
  const [dateTo, setDateTo] = useState(getDateRange('month').end as string);

  // 1. URL DINÁMICA (Seguridad)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";

  const token = useMemo(() => {
    if (!session?.user) return null;
    return (session as any).accessToken || (session.user as any).token || null;
  }, [session]);

  // 2. FETCH CON FILTROS
  const fetchData = useCallback(async () => {
    if (status === "loading" || !token) return;

    setLoading(true);
    setError(null);

    try {
      // Construimos la Query String con las fechas
      let query = `${API_URL}/reports/general`;
      
      const params = new URLSearchParams();
      if (filterType !== 'all') {
         if (dateFrom) params.append('start_date', dateFrom);
         if (dateTo) params.append('end_date', dateTo);
      }
      
      const finalUrl = `${query}?${params.toString()}`;
      console.log("Fetching Report:", finalUrl);

      const res = await fetch(finalUrl, {
        headers: { 
            Accept: "application/json",
            Authorization: `Bearer ${token}` 
        },
      });

      if (!res.ok) throw new Error("Error al cargar reporte financiero.");

      const json = await res.json();
      
      setData({
        ventas: Number(json.ventas || 0),
        compras: Number(json.compras || 0),
        utilidades: Number(json.utilidades || 0),
        usuariosActivos: Number(json.usuariosActivos || 0),
        ticketPromedio: Number(json.ticketPromedio || 0),
        totalOrdenes: Number(json.totalOrdenes || 0),
        tasaConversion: Number(json.tasaConversion || 0),
      });
      setLastUpdated(new Date());

    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, token, dateFrom, dateTo, filterType, API_URL]);

  // Manejo de cambio de filtros rápidos
  const handleFilterChange = (type: 'today' | 'month' | 'all') => {
      setFilterType(type);
      if (type === 'all') {
          setDateFrom("");
          setDateTo("");
      } else {
          const { start, end } = getDateRange(type);
          setDateFrom(start || "");
          setDateTo(end || "");
      }
  };

  // Cargar datos cuando cambien las fechas o el token
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Se dispara automáticamente al cambiar fechas gracias a useCallback

  const generatePDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(227, 49, 39);
    doc.text("Reporte Financiero Moto Store", 20, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Período: ${filterType === 'all' ? 'Histórico Completo' : `${dateFrom} al ${dateTo}`}`, 20, 28);
    
    let y = 40;
    doc.setTextColor(0); doc.setFontSize(12);
    [`Ventas: ${fmtMoney(data.ventas)}`, `Utilidad Neta: ${fmtMoney(data.utilidades)}`, `Costos: ${fmtMoney(data.compras)}`].forEach(l => { doc.text(l, 20, y); y += 10; });
    
    doc.save(`finanzas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER + FILTROS */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Reporte Financiero</h1>
          <p className="text-slate-500 font-medium">Balance de ingresos, costos y utilidad neta.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            {/* Botones Rápidos */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => handleFilterChange('today')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Hoy</button>
                <button onClick={() => handleFilterChange('month')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Este Mes</button>
                <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Todo</button>
            </div>

            {/* Selector de Fechas Personalizado */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400"/>
                <input type="date" value={dateFrom} onChange={(e) => { setFilterType('custom'); setDateFrom(e.target.value); }} className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24"/>
                <span className="text-slate-300">-</span>
                <input type="date" value={dateTo} onChange={(e) => { setFilterType('custom'); setDateTo(e.target.value); }} className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24"/>
            </div>

            <button onClick={generatePDF} disabled={!data} className="px-3 bg-slate-900 text-white rounded-lg hover:bg-[#E33127] transition-colors"><ArrowDownTrayIcon className="w-4 h-4"/></button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex gap-2 font-bold text-sm"><ExclamationTriangleIcon className="w-5 h-5"/> {error}</div>}

      {/* KPI CARDS - CALCULADOS CON FILTRO */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Ventas Totales"
          value={fmtMoney(data?.ventas)}
          icon={<IconDollar className="w-6 h-6 text-emerald-600" />}
          loading={loading}
          className="border-emerald-100 shadow-emerald-500/5"
          bgIcon="bg-emerald-50"
        />
        {/* Aquí mostramos Utilidad REAL */}
        <KpiCard
          label="Utilidad Neta (Ganancia)"
          value={fmtMoney(data?.utilidades)}
          icon={<IconTrend className="w-6 h-6 text-[#E33127]" />}
          loading={loading}
          className="border-red-100 shadow-red-500/5 ring-1 ring-red-50"
          bgIcon="bg-red-50"
        />
        <KpiCard
          label="Costos Operativos"
          value={fmtMoney(data?.compras)}
          icon={<IconCart className="w-6 h-6 text-blue-600" />}
          loading={loading}
          className="border-blue-100 shadow-blue-500/5"
          bgIcon="bg-blue-50"
        />
         <KpiCard
          label="Usuarios Activos"
          value={fmtNumber(data?.usuariosActivos)}
          icon={<IconUsers className="w-6 h-6 text-orange-600" />}
          loading={loading}
          className="border-orange-100 shadow-orange-500/5"
          bgIcon="bg-orange-50"
        />
      </section>

      {/* DETALLES */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Desglose Operativo</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
             {filterType === 'all' ? 'Histórico' : 'Rango Seleccionado'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              <Row name="Ticket Promedio" value={fmtMoney(data?.ticketPromedio)} desc="Promedio de gasto por cliente en este período." status="Healthy" loading={loading} />
              <Row name="Órdenes Procesadas" value={fmtNumber(data?.totalOrdenes)} desc="Cantidad de ventas completadas." status="Neutral" loading={loading} />
              <Row name="Tasa de Conversión" value={data?.tasaConversion ? `${data.tasaConversion}%` : "—"} desc="Eficiencia de ventas." status={Number(data?.tasaConversion) > 5 ? "Healthy" : "Warning"} loading={loading} />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTES VISUALES (Sin cambios grandes) ================= */
function KpiCard({ label, value, icon, loading, className, bgIcon }: any) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-xl transition-all hover:-translate-y-1 ${className || 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-2xl p-3 ${bgIcon || 'bg-slate-50'}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</h3>
        <div className="text-3xl font-black text-slate-900 tracking-tight">
          {loading ? <div className="h-9 w-24 bg-slate-100 rounded animate-pulse"></div> : value}
        </div>
      </div>
    </div>
  );
}

function Row({ name, value, desc, status, loading }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4 font-bold text-slate-700">{name}</td>
      <td className="px-6 py-4 font-mono font-medium text-slate-900">{loading ? "..." : value}</td>
      <td className="px-6 py-4 text-slate-400 text-xs">{desc}</td>
      <td className="px-6 py-4 text-right">
        {!loading && <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${status === "Healthy" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{status === "Healthy" ? "Bueno" : "Normal"}</span>}
      </td>
    </tr>
  );
}


