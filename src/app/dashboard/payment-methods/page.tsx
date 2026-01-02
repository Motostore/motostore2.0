'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from "react-hot-toast";
import { 
  CreditCardIcon, 
  ClipboardDocumentIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  QrCodeIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  GlobeAmericasIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// API PYTHON
const API_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1") + "/payment-methods";

const LOGO_MAP: Record<string, string> = {
  'MOBILE_PAYMENT': '/logos/pago_movil.png',
  'BANK_TRANSFER': '/logos/banesco.png',
  'BANESCO_PANAMA': '/logos/banesco.png',
  'MERCANTIL_PANAMA': '/logos/mercantil.png',
  'ZELLE_PAYMENT': '/logos/zelle.png',
  'PAYPAL_PAYMENT': '/logos/paypal.png',
  'FACEBANK_PAYMENT': '/logos/facebank.png',
  'PIPOL_PAYMENT': '/logos/pipol.png',
  'VENMO_PAYMENT': '/logos/venmo.png',
  'CASHAPP_PAYMENT': '/logos/cashapp.png',
  'BINANCE_PAYMENT': '/logos/binance.png',
  'USDT_PAYMENT': '/logos/usdt.png',
  'ZINLI_PAYMENT': '/logos/zinli.png',
  'WALLY_PAYMENT': '/logos/wally.png',
  'RESERVE_PAYMENT': '/logos/reserve.png',
  'ELDORADO_PAYMENT': '/logos/eldorado.png',
};

export type PaymentType = 
  | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH_PAYMENT'
  | 'ZELLE_PAYMENT' | 'PAYPAL_PAYMENT' | 'FACEBANK_PAYMENT' | 'PIPOL_PAYMENT' | 'VENMO_PAYMENT' | 'CASHAPP_PAYMENT'
  | 'BANESCO_PANAMA' | 'MERCANTIL_PANAMA'
  | 'BINANCE_PAYMENT' | 'ZINLI_PAYMENT' | 'WALLY_PAYMENT' | 'RESERVE_PAYMENT' | 'ELDORADO_PAYMENT' | 'USDT_PAYMENT';

export interface PM {
  id?: number;
  name: string;
  type: PaymentType;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  phone?: string;
  email?: string;
  id_number?: string;
  address?: string; 
}

export default function PaymentMethodsPage() {
  const [payments, setPayments] = useState<PM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newPayment, setNewPayment] = useState<PM>({ name: '', type: 'MOBILE_PAYMENT' });
  const [editingId, setLocalEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error ${res.status}: Conexión fallida`);
      const data = await res.json();
      setPayments(data);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError("No se pudo conectar al servidor Python.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const grouped = useMemo(() => {
    const out: Record<string, PM[]> = { 'Venezuela': [], 'Internacional / Panamá': [], 'Cripto & Wallets': [] };
    payments.forEach(m => {
      const t = m.type;
      if (['BINANCE_PAYMENT', 'USDT_PAYMENT', 'ZINLI_PAYMENT', 'WALLY_PAYMENT', 'RESERVE_PAYMENT', 'ELDORADO_PAYMENT'].includes(t)) {
        out['Cripto & Wallets'].push(m);
      } else if (['ZELLE_PAYMENT', 'PAYPAL_PAYMENT', 'BANESCO_PANAMA', 'MERCANTIL_PANAMA', 'FACEBANK_PAYMENT', 'PIPOL_PAYMENT', 'VENMO_PAYMENT', 'CASHAPP_PAYMENT'].includes(t)) {
        out['Internacional / Panamá'].push(m);
      } else {
        out['Venezuela'].push(m);
      }
    });
    return out;
  }, [payments]);

  const openNew = () => { setNewPayment({ name: '', type: 'MOBILE_PAYMENT' }); setLocalEditingId(null); setShowForm(true); };
  const openEdit = (p: PM) => { setNewPayment(p); setLocalEditingId(p.id!); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.name) return toast.error("Falta el nombre");
    const toastId = toast.loading("Guardando...");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment)
      });
      if (!res.ok) throw new Error("Error guardando");
      toast.success(editingId ? "¡Actualizado!" : "¡Creado!", { id: toastId });
      setShowForm(false);
      fetchPayments();
    } catch (e: any) { toast.error(e.message, { id: toastId }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar?")) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error borrando");
      toast.success("Eliminado", { id: toastId });
      fetchPayments();
    } catch (e) { toast.error("Error al eliminar", { id: toastId }); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER LIMPIO Y PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm"><BuildingLibraryIcon className="w-8 h-8 text-[#E33127]" /></div>
            <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Cuentas y Pagos</h1><p className="text-slate-500 font-medium mt-1">Gestión centralizada (Python).</p></div>
          </div>
          <button onClick={openNew} className="group flex items-center justify-center gap-2 px-6 py-3 bg-[#E33127] hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"><PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" /><span>Agregar Cuenta</span></button>
      </div>

      {error && (
         <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-bold shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3"><XMarkIcon className="w-6 h-6 flex-shrink-0" /><p>{error}</p></div>
            <button onClick={fetchPayments} className="flex items-center gap-1 underline hover:text-black font-bold"><ArrowPathIcon className="w-4 h-4"/> Reintentar</button>
         </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{[1, 2, 3].map(i => (<div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>))}</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([title, items]) => items.length > 0 && (
            <div key={title} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2 uppercase tracking-wider opacity-80 border-l-4 border-[#E33127] pl-3"><SparklesIcon className="w-5 h-5 text-[#E33127]" /> {title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p) => (<PremiumCard key={p.id} data={p} onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id!)} />))}
              </div>
            </div>
          ))}
          {payments.length === 0 && !error && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200"><BanknotesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-medium">No hay cuentas registradas.</p></div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black text-slate-900">{editingId ? 'Editar' : 'Nuevo'}</h2><button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100"><XMarkIcon className="w-6 h-6 text-slate-400"/></button></div>
            <form onSubmit={handleSave} className="space-y-6">
               <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Plataforma</label><select className="input-premium" value={newPayment.type} onChange={e => setNewPayment({...newPayment, type: e.target.value as any})}><optgroup label="Venezuela"><option value="MOBILE_PAYMENT">📱 Pago Móvil</option><option value="BANK_TRANSFER">🏦 Transferencia Bancaria</option><option value="CASH_PAYMENT">💵 Efectivo (Tienda)</option></optgroup><optgroup label="Internacional"><option value="ZELLE_PAYMENT">🇺🇸 Zelle</option><option value="PAYPAL_PAYMENT">🅿️ PayPal</option><option value="BANESCO_PANAMA">🇵🇦 Banesco Panamá</option><option value="MERCANTIL_PANAMA">🇵🇦 Mercantil Panamá</option><option value="FACEBANK_PAYMENT">🏦 Facebank</option><option value="PIPOL_PAYMENT">🟣 Pipol Pay</option></optgroup><optgroup label="Cripto"><option value="BINANCE_PAYMENT">🟡 Binance Pay</option><option value="USDT_PAYMENT">🟢 USDT</option><option value="ZINLI_PAYMENT">🟣 Zinli</option><option value="WALLY_PAYMENT">📱 Wally</option><option value="RESERVE_PAYMENT">®️ Reserve</option><option value="ELDORADO_PAYMENT">🔶 El Dorado</option></optgroup></select></div>
               <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alias</label><input className="input-premium" placeholder="Ej: Banesco Principal" value={newPayment.name} onChange={e => setNewPayment({...newPayment, name: e.target.value})} /></div>
               {(['BANK_TRANSFER', 'MOBILE_PAYMENT'].includes(newPayment.type)) && (<><input className="input-premium" placeholder="Banco" value={newPayment.bank_name || ''} onChange={e => setNewPayment({...newPayment, bank_name: e.target.value})} /><input className="input-premium" placeholder="Cédula/RIF" value={newPayment.id_number || ''} onChange={e => setNewPayment({...newPayment, id_number: e.target.value})} />{newPayment.type === 'MOBILE_PAYMENT' && <input className="input-premium" placeholder="Teléfono" value={newPayment.phone || ''} onChange={e => setNewPayment({...newPayment, phone: e.target.value})} />}{newPayment.type === 'BANK_TRANSFER' && <input className="input-premium" placeholder="Nro Cuenta" value={newPayment.account_number || ''} onChange={e => setNewPayment({...newPayment, account_number: e.target.value})} />}</>)}
               {newPayment.type === 'CASH_PAYMENT' && <textarea rows={3} className="input-premium" placeholder="Dirección..." value={newPayment.address || ''} onChange={e => setNewPayment({...newPayment, address: e.target.value})} />}
               {(!['BANK_TRANSFER', 'MOBILE_PAYMENT', 'CASH_PAYMENT'].includes(newPayment.type)) && (<><input className="input-premium" placeholder="Email / Usuario" value={newPayment.email || ''} onChange={e => setNewPayment({...newPayment, email: e.target.value})} /></>)}
               <button type="submit" className="w-full py-4 bg-[#E33127] text-white font-bold rounded-xl shadow-xl hover:bg-red-600 transition-all active:scale-[0.98]">{editingId ? 'Guardar' : 'Crear'}</button>
            </form>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <style jsx>{`.input-premium { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 500; color: #0f172a; outline: none; transition: all 0.2s; } .input-premium:focus { background: #fff; border-color: #E33127; box-shadow: 0 0 0 4px rgba(227, 49, 39, 0.1); }`}</style>
    </div>
  );
}

// ============================================================
// 👇 AQUÍ ESTÁ EL CAMBIO DE DISEÑO (UNIFICACIÓN PREMIUM)
// ============================================================
function PremiumCard({ data, onEdit, onDelete }: any) {
  const copy = (text: string) => { if (text) { navigator.clipboard.writeText(text); toast.success("Copiado"); }};
  
  // Iconos por tipo (pero ya no cambian el fondo de la tarjeta)
  const isCrypto = ['BINANCE_PAYMENT', 'ZINLI_PAYMENT', 'USDT_PAYMENT', 'WALLY_PAYMENT', 'RESERVE_PAYMENT', 'ELDORADO_PAYMENT'].includes(data.type);
  const isUSD = ['ZELLE_PAYMENT', 'PAYPAL_PAYMENT', 'BANESCO_PANAMA', 'MERCANTIL_PANAMA', 'FACEBANK_PAYMENT', 'PIPOL_PAYMENT', 'VENMO_PAYMENT', 'CASHAPP_PAYMENT'].includes(data.type);
  
  let Icon = isCrypto ? QrCodeIcon : isUSD ? GlobeAmericasIcon : BanknotesIcon;
  if (data.type === 'BANK_TRANSFER' || data.type === 'MOBILE_PAYMENT') Icon = CreditCardIcon;

  const mainInfo = data.account_number || data.phone || data.email || data.address || "N/A";
  const logoSrc = LOGO_MAP[data.type];

  return (
    // ✅ FONDO SIEMPRE BLANCO (bg-white), BORDE GRIS CLARO, SOMBRA SUAVE
    <div className="relative group p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      {/* Decoración sutil de fondo (rojo muy suave) */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          {/* Contenedor del Icono/Logo siempre consistente */}
          <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-red-100 transition-colors">
             {logoSrc ? (
               <Image src={logoSrc} alt={data.name} width={48} height={48} className="object-contain w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             ) : (
               <Icon className="w-6 h-6 text-slate-400 group-hover:text-[#E33127]"/>
             )}
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => {e.stopPropagation(); onEdit();}} className="p-2 bg-slate-50 hover:bg-white hover:shadow-md rounded-full text-slate-500 hover:text-[#E33127]"><PencilSquareIcon className="w-4 h-4"/></button>
            <button onClick={(e) => {e.stopPropagation(); onDelete();}} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full"><TrashIcon className="w-4 h-4"/></button>
          </div>
        </div>

        <h3 className="text-xl font-black tracking-tight mb-1 truncate text-slate-800">{data.name}</h3>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 group-hover:text-[#E33127] transition-colors">
           {data.type.replace(/_/g, ' ')}
        </p>

        <div className="space-y-3">
           <div onClick={() => copy(mainInfo)} className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-red-100 cursor-pointer flex justify-between items-center group/copy active:scale-95 transition-all">
              <div className="overflow-hidden">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Cuenta / ID</p>
                 <p className="font-mono text-sm font-bold text-slate-700 truncate">{mainInfo}</p>
              </div>
              <ClipboardDocumentIcon className="w-4 h-4 text-slate-300 group-hover/copy:text-[#E33127]"/>
           </div>
        </div>
      </div>
    </div>
  );
}

