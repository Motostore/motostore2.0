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
  ClipboardIcon // Icono para copiar
} from '@heroicons/react/24/outline';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

export default function AdminWithdrawalsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const getToken = () => {
    if (!session) return null;
    return (session as any).accessToken || (session as any).token || (session as any).user?.token;
  };
  
  const authHeader = useMemo(() => (getToken() ? { "Authorization": `Bearer ${getToken()}` } : undefined), [session]);

  const fetchRequests = useCallback(async () => {
    if (status !== 'authenticated' || !authHeader) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/withdrawals/pending`, { headers: authHeader });
      
      if (!res.ok) {
         if (res.status === 403) throw new Error("Acceso denegado. Rol incorrecto.");
         throw new Error("Error al obtener solicitudes pendientes.");
      }
      
      setRequests(await res.json());

    } catch (e: any) {
      toast.error(e.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, [authHeader, status]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const actionText = action === 'approve' ? "¿Confirmar el pago al usuario y completar la transacción?" : "¿Rechazar la solicitud y devolver el saldo a la cuenta?";
    if (!confirm(actionText)) return;
    
    setProcessingId(id);
    const toastId = toast.loading(`Procesando ${action === 'approve' ? 'aprobación' : 'rechazo'}...`);

    try {
      const res = await fetch(`${API_BASE}/withdrawals/${id}/${action}`, {
        method: "POST",
        headers: authHeader
      });

      if (!res.ok) {
         const err = await res.json().catch(() => ({ detail: "Error HTTP" }));
         throw new Error(err.detail || "Error en el servidor");
      }

      toast.success("Procesado correctamente", { id: toastId });
      // Eliminar de la lista sin recargar todo
      setRequests(prev => prev.filter(r => r.id !== id)); 
      
    } catch (e: any) {
      toast.error(`Error al procesar: ${e.message}`, { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Datos de pago copiados.");
  }
  
  if (status === 'loading') {
      return <div className="p-10 text-center text-slate-400 flex justify-center gap-2"><ArrowPathIcon className="w-5 h-5 animate-spin"/> Cargando panel...</div>;
  }
  
  // RENDERIZADO
  return (
    <div className="max-w-7xl mx-auto pb-20 px-6 animate-in fade-in">
        
        {/* HEADER (Ajuste de color) */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                    <BanknotesIcon className="w-8 h-8 text-[#E33127]" /> {/* Usamos color primario */}
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Administración de Retiros</h1>
                    <p className="text-slate-500 text-sm">Transacciones pendientes de aprobación de pago.</p>
                </div>
            </div>
            <button onClick={fetchRequests} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100" title="Actualizar lista">
                <ArrowPathIcon className={`w-6 h-6 text-slate-500 ${loading ? 'animate-spin' : ''}`}/>
            </button>
        </div>

        {/* LISTA */}
        <div className="space-y-6">
            {requests.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-100 mx-auto mb-3"/>
                    <p className="text-slate-400 font-bold">Sin retiros pendientes.</p>
                </div>
            )}

            {requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-xl transition-all">
                    
                    {/* IZQUIERDA: Info y Datos de Pago */}
                    <div className="flex-1 space-y-3 w-full xl:w-auto">
                        
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-100 rounded-full text-red-600 font-black text-xs border border-red-200">OUT</div>
                            <h3 className="text-3xl font-black text-slate-800">${req.amount.toFixed(2)}</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                                <UserIcon className="w-4 h-4"/> Solicitado por: {req.user_name}
                            </span>
                        </div>
                        
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">DATOS DE PAGO (COPIAR)</label>
                            <div className="flex items-stretch">
                                <textarea 
                                    readOnly
                                    value={req.note}
                                    className="flex-grow text-sm text-slate-700 bg-slate-50 p-3 rounded-l-xl border border-slate-200 font-medium resize-none overflow-y-hidden h-20 outline-none"
                                    onClick={(e) => copyToClipboard((e.target as HTMLTextAreaElement).value)}
                                />
                                <button
                                    onClick={() => copyToClipboard(req.note)}
                                    className="p-3 bg-slate-100 border border-slate-200 rounded-r-xl hover:bg-slate-200 transition-colors text-slate-600 self-stretch"
                                    title="Copiar datos al portapapeles"
                                >
                                    <ClipboardIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            <ClockIcon className="w-3 h-3 inline mr-1"/>
                            Solicitud creada: {new Date(req.created_at).toLocaleString()}
                        </p>
                    </div>

                    {/* DERECHA: Botones de Acción */}
                    <div className="flex flex-col gap-3 w-full xl:w-[250px] justify-end border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
                        <button 
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={processingId === req.id}
                            className="px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <XCircleIcon className="w-5 h-5"/> 
                            {processingId === req.id ? 'Rechazando...' : 'Rechazar (Devolver Saldo)'}
                        </button>
                        <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={processingId === req.id}
                            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processingId === req.id ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5"/>}
                            {processingId === req.id ? 'PAGANDO...' : 'PAGO REALIZADO (Aprobar)'}
                        </button>
                    </div>

                </div>
            ))}
        </div>
        <Toaster position="bottom-center" />
    </div>
  );
}