'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  BanknotesIcon, 
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

// 1. CORRECCIÓN: Usamos la misma variable que en todo el proyecto
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";

interface PaymentReport {
  id: number;
  amount: number;
  method: string;
  user_id: string | number;
  user_email?: string; // Si el backend lo envía
  note?: string;
  created_at: string;
  proof_url?: string;
  status: string;
}

export default function PaymentApprovalsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 👇 Tu función robusta para el Token (¡Excelente!)
  const getToken = () => {
    if (!session) return null;
    return (
        (session as any).accessToken || 
        (session as any).access_token || 
        (session as any).token || 
        (session as any).user?.token || 
        (session as any).user?.access_token ||
        (session as any).user?.accessToken
    );
  };

  const fetchReports = async () => {
    if (status === "loading") return; 
    
    const token = getToken();
    
    if (!token) {
        if (status === "authenticated") {
            toast.error("Error de sesión: No se encontró el token.");
        }
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      // 2. Endpoint corregido y limpio
      const res = await fetch(`${API_BASE}/payments?status=PENDING`, { 
        headers: { "Authorization": `Bearer ${token}` }
      }); 
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Acceso denegado o sesión expirada.");
        throw new Error(`Error ${res.status}`);
      }
      
      const data = await res.json();
      // Aseguramos que sea un array
      setReports(Array.isArray(data) ? data : data.items || []);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchReports();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} este pago?`)) return;
    
    setProcessingId(id);
    const toastId = toast.loading("Procesando...");

    try {
      const token = getToken();
      if (!token) throw new Error("Sesión inválida.");

      const res = await fetch(`${API_BASE}/payments/${id}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al procesar la solicitud.");

      toast.success(action === 'approve' ? "¡Pago Aprobado!" : "Pago Rechazado", { id: toastId });
      
      // Actualizar lista visualmente (Optimistic UI)
      setReports(prev => prev.filter(r => r.id !== id));

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  // --- RENDERS ---

  if (status === "loading") {
      return (
        <div className="flex h-96 w-full items-center justify-center text-slate-400 gap-2">
            <ArrowPathIcon className="w-6 h-6 animate-spin"/> Cargando panel seguro...
        </div>
      );
  }

  if (status === "unauthenticated") {
      return (
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3"/>
            <h2 className="text-xl font-bold text-red-700">Acceso Restringido</h2>
            <p className="text-red-600 mt-2">Solo administradores pueden ver esta sección.</p>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
               <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Aprobación de Pagos</h1>
               <p className="text-slate-500 text-sm font-medium">Validación de recargas pendientes.</p>
            </div>
        </div>
        <button 
            onClick={fetchReports} 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-[#E33127] hover:text-white transition-all font-bold text-sm border border-slate-200 hover:border-[#E33127]"
        >
            <ArrowPathIcon className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Lista
        </button>
      </div>

      {/* LISTADO DE TARJETAS */}
      <div className="space-y-4">
        {reports.length === 0 && !loading && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <CheckCircleIcon className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                <p className="text-slate-800 font-bold text-lg">¡Todo al día!</p>
                <p className="text-slate-400 text-sm">No hay pagos pendientes de revisión.</p>
            </div>
        )}

        {reports.map((report) => (
            <div key={report.id} className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-0.5 transition-all duration-300 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group">
                
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -z-0 opacity-50"></div>

                {/* INFO IZQUIERDA */}
                <div className="flex items-start gap-5 z-10 w-full lg:w-auto">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-100 shadow-sm flex-shrink-0">
                        <ClockIcon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-black text-slate-800 text-2xl tracking-tight">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.amount)}
                            </h3>
                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200 tracking-wider">
                                {report.method}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-2">
                            <UserCircleIcon className="w-4 h-4"/>
                            <span>Cliente ID: <strong className="text-slate-700">#{report.user_id}</strong></span>
                        </div>
                        
                        {report.note && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-md italic">
                                "{report.note}"
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            <CalendarDaysIcon className="w-4 h-4"/>
                            {new Date(report.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* BOTONES DERECHA */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-5 lg:pt-0 z-10">
                    
                    {report.proof_url ? (
                        <a 
                            // Corrección para URL de imagen segura
                            href={report.proof_url.startsWith('http') ? report.proof_url : `${API_BASE.replace('/api/v1', '')}/${report.proof_url}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-4 py-3 rounded-xl hover:bg-slate-50 hover:text-[#E33127] transition-all border border-slate-200 shadow-sm"
                        >
                            <DocumentMagnifyingGlassIcon className="w-4 h-4"/> Ver Comprobante
                        </a>
                    ) : (
                        <span className="text-xs text-slate-300 italic mr-2 select-none">Sin comprobante</span>
                    )}

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>

                    <button 
                        onClick={() => handleAction(report.id, 'reject')} 
                        disabled={processingId === report.id} 
                        className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50 active:scale-95"
                    >
                        Rechazar
                    </button>
                    
                    <button 
                        onClick={() => handleAction(report.id, 'approve')} 
                        disabled={processingId === report.id} 
                        className="px-6 py-3 rounded-xl bg-[#E33127] text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                    >
                        {processingId === report.id ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                        Aprobar
                    </button>
                </div>
            </div>
        ))}
      </div>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#0f172a', color: '#fff', fontSize: '14px', borderRadius: '12px' } }} />
    </div>
  );
}