'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowRightCircleIcon,
  WalletIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowDownCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

export default function WalletPage() {
  const { data: session, status } = useSession();
  
  /* ===== Estado ===== */
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario de retiro
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [processing, setProcessing] = useState(false);

  const getToken = () => {
    if (!session) return null;
    return (
        (session as any).accessToken || 
        (session as any).token || 
        (session as any).user?.token || 
        (session as any).user?.accessToken
    );
  };

  const fetchWallet = async () => {
    if (status === "loading") return;
    const token = getToken();
    
    if (!token) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wallet/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        setHistory(data.history || []);
      }
    } catch (e) { 
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, [status]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return toast.error("Error de sesión. Recarga la página.");

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return toast.error("Ingresa un monto válido");
    if (parseFloat(withdrawAmount) > balance) return toast.error("Saldo insuficiente");
    if (!bankInfo) return toast.error("Ingresa tus datos de pago");

    setProcessing(true);
    const toastId = toast.loading("Procesando solicitud...");

    try {
        const res = await fetch(`${API_BASE}/wallet/withdraw`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                amount: parseFloat(withdrawAmount), 
                bank_info: bankInfo 
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al retirar");
        }

        toast.success("Solicitud enviada con éxito", { id: toastId });
        fetchWallet();
        setWithdrawAmount("");
        setBankInfo("");
    } catch (e: any) {
        toast.error(e.message, { id: toastId });
    } finally {
        setProcessing(false);
    }
  };

  if (status === "loading") {
      return <div className="p-10 text-center text-slate-400 flex justify-center gap-2"><ArrowPathIcon className="w-5 h-5 animate-spin"/> Cargando billetera...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mi Billetera / <span className="text-[#E33127]">Retiro</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
            Gestiona tu saldo disponible y solicita retiros.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
        
        {/* COLUMNA IZQUIERDA: TARJETA DE SALDO Y RETIRO */}
        <div className="lg:col-span-7 space-y-6">
            
            {/* 🛑 TARJETA BLANCA PREMIUM (SALDO) - FONDO CORREGIDO 🛑 */}
            <div className="bg-white text-slate-900 p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 group">
                {/* Decoración Roja Suave */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50/50 rounded-full blur-3xl group-hover:bg-red-50/80 transition-all duration-700"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-[#E33127] font-bold text-sm uppercase tracking-widest">
                        <WalletIcon className="w-5 h-5"/> SALDO DISPONIBLE
                    </div>
                    <h2 className="text-6xl font-black tracking-tight mb-6">
                        ${balance.toFixed(2)}
                    </h2>
                    
                    <div className="flex gap-4">
                        <button onClick={fetchWallet} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-sm font-bold text-slate-600">
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/> Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* FORMULARIO DE RETIRO */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-red-50 text-[#E33127] rounded-xl">
                        <ArrowDownCircleIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Solicitar Retiro</h3>
                        <p className="text-slate-400 text-xs">El dinero se descontará inmediatamente de tu saldo.</p>
                    </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Monto a retirar ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                className="w-full pl-8 pr-4 py-4 rounded-xl border border-slate-200 font-black text-lg outline-none focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 transition-all" 
                                value={withdrawAmount} 
                                onChange={e => setWithdrawAmount(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Datos de Pago</label>
                        <textarea 
                            rows={3}
                            placeholder="Ej: Pago Móvil Banesco 0414-1234567, C.I: 12345678" 
                            className="w-full p-4 rounded-xl border border-slate-200 font-medium outline-none focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 transition-all text-slate-700 resize-none" 
                            value={bankInfo} 
                            onChange={e => setBankInfo(e.target.value)} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing || balance <= 0 || parseFloat(withdrawAmount) > balance}
                        className="w-full py-4 bg-[#E33127] text-white font-bold rounded-xl shadow-xl shadow-red-500/20 hover:bg-red-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {processing ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <PaperAirplaneIcon className="w-5 h-5"/>}
                        {processing ? 'ENVIANDO...' : 'SOLICITAR RETIRO'}
                    </button>
                </form>
            </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL */}
        <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2 px-2">
                    <ClockIcon className="w-5 h-5 text-slate-400"/> Historial de Movimientos
                </h3>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-slate-400 font-medium text-sm">Sin movimientos aún.</p>
                        </div>
                    )}
                    
                    {history.map((tx) => {
                        const isPositive = tx.amount > 0;
                        return (
                            <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group">
                                <div className="overflow-hidden">
                                    <p className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-0.5">
                                        {tx.type.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate max-w-[180px]" title={tx.note}>
                                        {tx.note || "Sin detalle"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                        {new Date(tx.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className={`text-right ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                    <span className="block font-black text-lg">
                                        {isPositive ? '+' : ''}{tx.amount.toFixed(2)}$
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                        {isPositive ? 'INGRESO' : 'EGRESO'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}













