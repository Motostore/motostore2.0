'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  CurrencyDollarIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

// --- CONFIGURACIÓN ---
const API_BASE = "https://motostore-api.onrender.com/api/v1";

export default function TicketPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  // Estados
  const [search, setSearch] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [operationType, setOperationType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [processing, setProcessing] = useState(false);

  // 1. BUSCAR USUARIO
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    
    setLoadingUser(true);
    setSelectedUser(null);

    try {
      // Buscamos por email o ID
      const res = await fetch(`${API_BASE}/users/search?query=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Usuario no encontrado");
      
      const data = await res.json();
      // Si la API devuelve un array, tomamos el primero. Si es objeto, lo usamos directo.
      const user = Array.isArray(data) ? data[0] : data;
      
      if (!user) {
          toast.error("No se encontró ningún usuario.");
      } else {
          setSelectedUser(user);
          toast.success("Usuario localizado");
      }
    } catch (err) {
      toast.error("Error al buscar usuario. Verifica el email.");
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  }

  // 2. EJECUTAR TRANSACCIÓN (Recarga o Cobro)
  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    setProcessing(true);
    const loadingToast = toast.loading("Procesando transacción...");

    try {
        // Endpoint dinámico: Crédito (Recarga) o Débito (Cobro)
        const endpoint = operationType === 'CREDIT' 
            ? `${API_BASE}/wallet/admin/credit` 
            : `${API_BASE}/wallet/admin/debit`;

        const payload = {
            user_id: selectedUser.id || selectedUser._id, // Soporta ambos formatos de ID
            amount: parseFloat(amount),
            description: note || (operationType === 'CREDIT' ? "Recarga manual en Taquilla" : "Venta en Taquilla"),
            reference: `POS-${Date.now()}` // Genera referencia única automática
        };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Error en la transacción");
        }

        toast.dismiss(loadingToast);
        toast.success(`Transacción exitosa: $${amount}`);
        
        // Limpiar formulario tras éxito
        setAmount("");
        setNote("");
        setSearch("");
        setSelectedUser(null); 

    } catch (error: any) {
        toast.dismiss(loadingToast);
        toast.error(error.message);
    } finally {
        setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in">
      <Toaster position="bottom-right" />
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl">
                <TicketIcon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    Taquilla Virtual
                </h1>
                <p className="text-slate-500 font-medium text-xs mt-1">
                    Gestión de saldo y operaciones manuales.
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 grid gap-8 md:grid-cols-12">
        
        {/* COLUMNA IZQUIERDA: BUSCADOR (4 cols) */}
        <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Identificar Cliente</h3>
                
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Email del usuario..." 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={loadingUser} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {loadingUser ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <MagnifyingGlassIcon className="w-4 h-4"/>}
                    </button>
                </form>

                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                    Ingresa el correo exacto del usuario para cargar su billetera y realizar operaciones.
                </p>
            </div>

            {/* TARJETA DE USUARIO ENCONTRADO */}
            {selectedUser && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-300/50 animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-[#E33127]" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Cliente Seleccionado</p>
                            <p className="font-bold text-sm truncate max-w-[150px]">{selectedUser.name || "Usuario"}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="font-mono text-xs break-all">{selectedUser.email}</p>
                        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Saldo Actual:</span>
                            <span className="font-bold text-emerald-400">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedUser.balance || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* COLUMNA DERECHA: OPERACIÓN (8 cols) */}
        <div className="md:col-span-8">
            <div className={`bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden transition-opacity duration-500 ${selectedUser ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none grayscale'}`}>
                
                {/* TABS TIPO DE OPERACIÓN */}
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setOperationType('CREDIT')}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-wide transition-colors ${operationType === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Recargar Saldo (+)
                    </button>
                    <button 
                        onClick={() => setOperationType('DEBIT')}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-wide transition-colors ${operationType === 'DEBIT' ? 'bg-red-50 text-red-600 border-b-2 border-red-500' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Cobrar / Debitar (-)
                    </button>
                </div>

                <form onSubmit={handleTransaction} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto de la Operación</label>
                        <div className="relative">
                            <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <input 
                                type="number" 
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                required
                                className="w-full pl-12 pr-4 py-4 text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nota o Descripción</label>
                        <textarea 
                            rows={2}
                            placeholder={operationType === 'CREDIT' ? "Ej: Recarga en efectivo Ref. 1234" : "Ej: Compra de Pantalla Netflix"}
                            className="w-full p-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none resize-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={processing || !amount}
                        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2 ${operationType === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-[#E33127] hover:bg-red-600 shadow-red-500/20'}`}
                    >
                        {processing ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5"/>}
                        {processing ? "Procesando..." : operationType === 'CREDIT' ? "Confirmar Recarga" : "Confirmar Cobro"}
                    </button>
                </form>
            </div>
            
            {!selectedUser && (
                <div className="mt-4 text-center">
                    <p className="text-xs font-bold text-slate-400 bg-slate-100 inline-block px-4 py-2 rounded-full">
                        👈 Busca un usuario primero para activar el panel
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
