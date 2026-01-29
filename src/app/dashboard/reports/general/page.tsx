"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  FunnelIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

/* ================= TIPOS ================= */
type ReportData = {
  ventas: number;
  compras: number;
  utilidades: number;
  usuariosActivos: number;
  ticketPromedio: number;
  totalOrdenes: number;
  tasaConversion: number;
};

/* ================= HELPERS ================= */
const getDateRange = (type: 'today' | 'month' | 'all') => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (type === 'today') {
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
    } else if (type === 'month') {
        start.setDate(1); 
        start.setHours(0,0,0,0);
    } else {
        return { start: "", end: "" }; 
    }
    return { 
        start: start.toISOString().split('T')[0], 
        end: end.toISOString().split('T')[0] 
    };
};

const fmtMoney = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
};

const fmtNumber = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("es-ES").format(n);
};

/* ================= COMPONENTE PRINCIPAL ================= */
export default function ReportsGeneralPage() {
  const { data: session, status } = useSession();

  // Estados
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'today' | 'month' | 'custom' | 'all'>('month');
  const [dateFrom, setDateFrom] = useState(getDateRange('month').start as string);
  const [dateTo, setDateTo] = useState(getDateRange('month').end as string);

  // 1. URL SEGURA (Evita dobles slashes)
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/$/, "");
  
  const token = useMemo(() => {
    if (!session?.user) return null;
    return (session as any).accessToken || (session.user as any).token || null;
  }, [session]);

  // 2. FETCH DATOS
  const fetchData = useCallback(async () => {
    if (status === "loading" || !token) return;

    setLoading(true);
    setError(null);

    try {
      let query = `${API_BASE}/reports/general`;
      const params = new URLSearchParams();
      
      if (filterType !== 'all' && dateFrom && dateTo) {
         params.append('start_date', dateFrom);
         params.append('end_date', dateTo);
      }
      
      const finalUrl = `${query}?${params.toString()}`;
      
      const res = await fetch(finalUrl, {
        headers: { 
            Accept: "application/json",
            Authorization: `Bearer ${token}` 
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Sesión expirada.");
        throw new Error("No se pudo cargar el reporte financiero.");
      }

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

    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, token, dateFrom, dateTo, filterType, API_BASE]);

  // Manejo de cambio de filtros
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, filterType]); 

  // Generar PDF (Estilo Corporativo)
  const generatePDF = () => {
    if (!data) return;
    const doc = new jsPDF();

    // Header Rojo
    doc.setFillColor(227, 49, 39);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte General - Moto Store", 14, 13);

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha Emisión: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Rango: ${filterType === 'all' ? 'Histórico Completo' : `${dateFrom} al ${dateTo}`}`, 14, 35);

    // Cuerpo
    let y = 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Financiero", 14, y);
    y += 10;

    const lines = [
      `Ventas Totales: ${fmtMoney(data.ventas)}`,
      `Costos / Compras: ${fmtMoney(data.compras)}`,
      `Utilidad Neta: ${fmtMoney(data.utilidades)}`,
      `Ticket Promedio: ${fmtMoney(data.ticketPromedio)}`,
      `Usuarios Activos: ${fmtNumber(data.usuariosActivos)}`
    ];

    doc.setFont("helvetica", "normal");
    lines.forEach(line => {
      doc.text(line, 20, y);
      y += 8;
    });

    doc.save(`reporte_general_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl pb-20 animate-in fade-in duration-500">
      
      {/* HEADER + FILTROS */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-2xl">
             <BanknotesIcon className="w-8 h-8 text-slate-600"/>
          </div>
          <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900">Reporte General</h1>
             <p className="text-slate-500 font-medium">Panorama financiero completo.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => handleFilterChange('today')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Hoy</button>
                <button onClick={() => handleFilterChange('month')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Mes</button>
                <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Todo</button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400"/>
                <input type="date" value={dateFrom} onChange={(e) => { setFilterType('custom'); setDateFrom(e.target.value); }} className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24"/>
                <span className="text-slate-300">-</span>
                <input type="date" value={dateTo} onChange={(e) => { setFilterType('custom'); setDateTo(e.target.value); }} className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24"/>
            </div>

            <button onClick={() => fetchData()} disabled={loading} className="px-3 bg-slate-50 text-slate-600 hover:text-[#E33127] rounded-lg border border-slate-100"><ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/></button>
            <button onClick={generatePDF} disabled={!data} className="px-3 bg-[#E33127] text-white rounded-lg hover:bg-red-700 shadow-md shadow-red-200"><ArrowDownTrayIcon className="w-4 h-4"/></button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex gap-2 font-bold text-sm items-center">
            <ExclamationTriangleIcon className="w-5 h-5"/> {error}
        </div>
      )}

      {/* KPI CARDS */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Ventas Totales"
          value={fmtMoney(data?.ventas)}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Utilidad Neta"
          value={fmtMoney(data?.utilidades)}
          color="red"
          loading={loading}
          highlight
        />
        <KpiCard
          label="Costos Operativos"
          value={fmtMoney(data?.compras)}
          color="blue"
          loading={loading}
        />
         <KpiCard
          label="Usuarios Activos"
          value={fmtNumber(data?.usuariosActivos)}
          color="orange"
          loading={loading}
        />
      </section>

      {/* TABLA DETALLES */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400"/> Indicadores Clave
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border px-2 py-1 rounded">
             {filterType === 'all' ? 'Histórico' : 'Filtrado'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
                <tr>
                    <th className="px-6 py-3">Métrica</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Estado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <Row name="Ticket Promedio" value={fmtMoney(data?.ticketPromedio)} status="Healthy" loading={loading} />
              <Row name="Órdenes Totales" value={fmtNumber(data?.totalOrdenes)} status="Neutral" loading={loading} />
              <Row name="Tasa de Conversión" value={data?.tasaConversion ? `${data.tasaConversion}%` : "—"} status={Number(data?.tasaConversion) > 1 ? "Healthy" : "Warning"} loading={loading} />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTES VISUALES ================= */
function KpiCard({ label, value, color, loading, highlight }: any) {
  const styles: any = {
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      red: "text-red-600 bg-red-50 border-red-100",
      blue: "text-blue-600 bg-blue-50 border-blue-100",
      orange: "text-orange-600 bg-orange-50 border-orange-100"
  };
  const theme = styles[color] || styles.emerald;

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-xl transition-all hover:-translate-y-1 ${highlight ? 'ring-1 ring-offset-2 ring-red-100' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-2 h-2 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
      </div>
      <div className={`text-3xl font-black tracking-tight ${color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
          {loading ? <div className="h-8 w-24 bg-slate-100 rounded animate-pulse"></div> : value}
      </div>
    </div>
  );
}

function Row({ name, value, status, loading }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-700">{name}</td>
      <td className="px-6 py-4 font-mono font-medium text-slate-900">{loading ? "..." : value}</td>
      <td className="px-6 py-4">
        {!loading && <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide border ${status === "Healthy" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : status === "Warning" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>{status === "Healthy" ? "Bueno" : status === "Warning" ? "Bajo" : "Normal"}</span>}
      </td>
    </tr>
  );
}

