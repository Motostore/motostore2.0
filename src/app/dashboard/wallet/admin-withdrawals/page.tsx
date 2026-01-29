'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  UserIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';

// ✅ CONSISTENCIA: Usamos la misma variable que en los otros archivos
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/$/, "");

export default function AdminWithdrawalsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 👇 Captura robusta de Token
  const getToken = useCallback(() => {
    if (!session) return null;
    return (
        (session as any).accessToken || 
        (session as any).token || 
        (session as any).user?.token || 
        (session as any).user?.accessToken
    );
  }, [session]);
  
  const authHeader = useMemo(() => {
    const token = getToken();
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : null;
  }, [getToken]);

  const fetchRequests = useCallback(async () => {
    if (status !== 'authenticated' || !authHeader) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/withdrawals/pending`, { 
        headers: authHeader,
        cache: 'no-store'
      });
      
      if (!res.ok) {
         if (res.status === 403) throw new Error("Acceso denegado. Se requiere rol administrativo.");
         throw new Error("Error al obtener solicitudes.");
      }
      
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : data.items || []);

    } catch (e: any) {
      toast.error(e.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [authHeader, status]);

  useEffect(() => { 
    if (status === 'authenticated' && authHeader) fetchRequests(); 
  }, [status, authHeader, fetchRequests]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const actionText = action === 'approve' 
        ? "¿Confirmar que ya realizaste el pago manualmente al usuario?" 
        : "¿Rechazar solicitud? El saldo volverá a la cuenta del usuario.";
        
    if (!confirm(actionText)) return;
    
    setProcessingId(id);
    const toastId = toast.loading(`Procesando...`);

    try {
      const res = await fetch(`${API_BASE}/withdrawals/${id}/${action}`, {
        method: "POST",
        headers: authHeader as HeadersInit
      });

      if (!res.ok) {
         const err = await res.json().catch(() => ({ detail: "Error en el servidor" }));
         throw new Error(err.detail || "No se pudo procesar el retiro");
      }

      toast.success(action === 'approve' ? "¡Retiro marcado como pagado!" : "Retiro rechazado", { id: toastId });
      setRequests(prev => prev.filter(r => r.id !== id)); 
      
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Datos copiados al portapapeles");
  }
  
  if (status === 'loading') {
      return (
        <div className="flex h-96 items-center justify-center text-slate-400 gap-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin"/> Cargando administración...
        </div>
      );
  }
  
  return (
    <div className="max-w-7xl mx-auto pb-20 px-6 animate-in fade-in duration-500">
        
        {/* HEADER PREMIUM */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                    <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Retiros</h1>
                    <p className="text-slate-500 text-sm font-medium">Pagos pendientes por procesar.</p>
                </div>
            </div>
            <button 
                onClick={fetchRequests} 
                disabled={loading}
                className="p-3 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-[#E33127] transition-all border border-slate-100"
            >
                <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`}/>
            </button>
        </div>

        {/* LISTADO */}
        <div className="space-y-6">
            {requests.length === 0 && !loading && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-100 mx-auto mb-3"/>
                    <p className="text-slate-800 font-bold">¡Todo pagado!</p>
                    <p className="text-slate-400 text-sm">No hay solicitudes de retiro pendientes.</p>
                </div>
            )}

            {requests.map((req) => (
                <div key={req.id} className="relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-xl hover:border-red-100 transition-all duration-300 group">
                    
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-red-100 rounded-lg text-[#E33127] font-black text-[10px] border border-red-200 uppercase tracking-widest">Retiro</div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                                ${Number(req.amount).toFixed(2)}
                            </h3>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                                <UserIcon className="w-4 h-4"/> {req.user_name || 'Usuario'}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instrucciones de Pago</label>
                            <div className="flex group/copy">
                                <div className="flex-grow bg-slate-50 p-4 rounded-l-2xl border border-slate-200 text-sm font-mono text-slate-700 break-all leading-relaxed">
                                    {req.note || "Sin instrucciones específicas."}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(req.note)}
                                    className="px-5 bg-slate-100 border border-l-0 border-slate-200 rounded-r-2xl hover:bg-[#E33127] hover:text-white transition-all group-hover/copy:border-[#E33127]"
                                    title="Copiar datos"
                                >
                                    <ClipboardIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ClockIcon className="w-3.5 h-3.5"/>
                            Solicitado el: {new Date(req.created_at).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full xl:w-[280px] pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                        <button 
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={processingId === req.id}
                            className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50 text-sm active:scale-95"
                        >
                            {processingId === req.id ? '...' : 'Rechazar Solicitud'}
                        </button>
                        <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={processingId === req.id}
                            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {processingId === req.id ? <ArrowPathIcon className="w-6 h-6 animate-spin"/> : <CheckCircleIcon className="w-6 h-6"/>}
                            {processingId === req.id ? 'PROCESANDO...' : 'MARCAR COMO PAGADO'}
                        </button>
                    </div>

                </div>
            ))}
        </div>
        <Toaster position="bottom-right" />
    </div>
  );
}