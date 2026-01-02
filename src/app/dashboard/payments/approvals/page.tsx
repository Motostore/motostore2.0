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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function PaymentApprovalsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 👇 FUNCIÓN ROBUSTA PARA ENCONTRAR EL TOKEN
  const getToken = () => {
    if (!session) return null;
    // Buscamos en todas las variantes posibles de NextAuth
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
    
    // Si no hay token, no intentamos (evita el error 401 inmediato)
    if (!token) {
        if (status === "authenticated") {
            toast.error("Error de sesión: No se encontró el token de seguridad.");
        }
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`
      };

      const res = await fetch(`${API_BASE}/payments?status=PENDING`, { headers }); 
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            throw new Error("No tienes permiso de Administrador o tu sesión expiró.");
        }
        const txt = await res.text();
        throw new Error(txt || `Error ${res.status}`);
      }
      
      const data = await res.json();
      setReports(data);
    } catch (error: any) {
      console.error("Error cargando pagos:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Cargar al inicio y cuando la sesión esté lista
  useEffect(() => {
    if (status === "authenticated") {
        fetchReports();
    } else if (status === "unauthenticated") {
        setLoading(false); // Dejar de cargar si no hay usuario
    }
  }, [status]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} este pago?`)) return;
    
    setProcessingId(id);
    const toastId = toast.loading("Procesando...");

    try {
      const token = getToken();
      if (!token) throw new Error("Sesión inválida. Recarga la página.");

      const res = await fetch(`${API_BASE}/payments/${id}/${action}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      toast.success(action === 'approve' ? "¡Pago Aprobado y Saldo Cargado!" : "Pago Rechazado correctamente", { id: toastId });
      
      // Actualizar lista visualmente
      setReports(prev => prev.filter(r => r.id !== id));

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

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
            <p className="text-red-600 mt-2">Debes iniciar sesión como Administrador para ver esta página.</p>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
            <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Aprobación de Pagos</h1>
            <p className="text-slate-500 text-sm font-medium">
               Panel de Control (Admin: <span className="font-bold text-slate-700">{session?.user?.name}</span>)
            </p>
            </div>
        </div>
        <button 
            onClick={fetchReports} 
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-[#E33127] transition-all font-bold text-sm"
        >
            <ArrowPathIcon className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
        </button>
      </div>

      {/* LISTADO */}
      <div className="space-y-4">
        {reports.length === 0 && !loading && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <CheckCircleIcon className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                <p className="text-slate-800 font-bold text-lg">¡Todo al día!</p>
                <p className="text-slate-400 text-sm">No hay pagos pendientes de revisión en este momento.</p>
            </div>
        )}

        {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group">
                
                {/* INFORMACIÓN DEL REPORTE */}
                <div className="flex items-start gap-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-100 shadow-sm mt-1">
                        <ClockIcon className="h-6 w-6" />
                    </span>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-slate-800 text-xl">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.amount)}
                            </h3>
                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 tracking-wide">
                                {report.method}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Solicitado por Cliente ID: <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">#{report.user_id}</span>
                        </p>
                        
                        {report.note && (
                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-md">
                                <span className="font-bold text-slate-400 uppercase text-[10px] mr-1">Nota:</span> 
                                {report.note}
                            </div>
                        )}
                        
                        <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
                            📅 {new Date(report.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-5 lg:pt-0">
                    
                    {report.proof_url ? (
                        <a 
                            href={`${API_BASE.replace('/api/v1', '')}/${report.proof_url}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-xl hover:bg-slate-100 hover:text-[#E33127] transition-colors mr-2 border border-slate-200"
                        >
                            <DocumentMagnifyingGlassIcon className="w-4 h-4"/> Ver Comprobante
                        </a>
                    ) : (
                        <span className="text-xs text-slate-400 italic mr-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">Sin foto</span>
                    )}

                    <button 
                        onClick={() => handleAction(report.id, 'reject')} 
                        disabled={processingId === report.id} 
                        className="px-5 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50 active:scale-95"
                    >
                        Rechazar
                    </button>
                    
                    <button 
                        onClick={() => handleAction(report.id, 'approve')} 
                        disabled={processingId === report.id} 
                        className="px-6 py-3 rounded-xl bg-[#E33127] text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                    >
                        {processingId === report.id ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                        Aprobar Recarga
                    </button>
                </div>
            </div>
        ))}
      </div>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
    </div>
  );
}