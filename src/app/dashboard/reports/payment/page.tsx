"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { 
  CloudArrowUpIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  CheckBadgeIcon, 
  BanknotesIcon,
  ArrowPathIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

// ⚠️ AJUSTE CRÍTICO: Misma API que usas en el Admin
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

// Mapa de Iconos/Logos para que se vea bonito según el tipo
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
  'CASH_PAYMENT': '/logos/cash.png', 
};

export default function ReportPaymentPage() {
  // ESTADO
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  // FORMULARIO
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const TASA_BCV = 65.50; 

  // --- 1. CARGAR MÉTODOS DESDE PYTHON ---
  useEffect(() => {
    fetch(`${API_BASE}/payment-methods`)
      .then(res => res.json())
      .then(data => {
        setBanks(data);
        setLoadingBanks(false);
      })
      .catch(err => {
        console.error("Error cargando bancos:", err);
        toast.error("No se pudieron cargar los bancos");
        setLoadingBanks(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedBankId) return toast.error("Selecciona un banco");
    if (!amount) return toast.error("Ingresa el monto");
    if (!reference) return toast.error("Ingresa la referencia");

    setLoading(true);
    const toastId = toast.loading("Enviando reporte...");
    
    // Buscar el objeto del banco seleccionado para enviar su nombre/tipo
    const bankObj = banks.find(b => b.id === selectedBankId);

    try {
      const fd = new FormData();
      // Enviamos el nombre del método (ej: "Pago Móvil Banesco") o el ID según tu backend
      fd.append("method", bankObj?.name || "Desconocido"); 
      fd.append("amount", amount);
      fd.append("status", "PENDING"); // Estado inicial
      fd.append("note", `Ref: ${reference} - Banco: ${bankObj?.bank_name || bankObj?.type}`);
      
      if (file) {
        fd.append("proof_url", file); 
      }

      const endpoint = `${API_BASE}/payments`; // Asegúrate que esta ruta exista en tu backend
      
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Error al procesar el pago");
      }

      toast.success("¡Pago reportado exitosamente!", { id: toastId });
      
      setAmount("");
      setReference("");
      setFile(null);
      setSelectedBankId(null);

    } catch (error: any) {
      console.error(error);
      toast.error("Error al reportar pago", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const isBs = selectedBank?.type === 'MOBILE_PAYMENT' || selectedBank?.type === 'BANK_TRANSFER';

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
          <BanknotesIcon className="w-8 h-8 text-[#E33127]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportar Pago</h1>
          <p className="text-slate-500 text-sm font-medium">Registra tu transferencia para recargar saldo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- IZQUIERDA: SELECTOR DINÁMICO --- */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Paso 1</span>
            Selecciona donde pagaste
          </h3>
          
          {loadingBanks ? (
             <div className="grid grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {banks.map((bank) => {
                const logo = LOGO_MAP[bank.type] || null;
                const isSelected = selectedBankId === bank.id;

                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 group text-left
                      ${isSelected 
                        ? `border-[#E33127] bg-white ring-4 ring-red-500/10 shadow-lg scale-[1.02] z-10` 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-[#E33127] animate-in zoom-in">
                        <CheckBadgeIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="relative w-10 h-10 flex-shrink-0">
                      {logo ? (
                         <Image 
                           src={logo} 
                           alt={bank.name} 
                           width={40} height={40} 
                           className="object-contain"
                         />
                      ) : (
                         <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
                            <BuildingLibraryIcon className="w-5 h-5 text-slate-400"/>
                         </div>
                      )}
                    </div>
                    
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-xs leading-tight truncate">{bank.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {bank.bank_name || bank.type.replace('_',' ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* DETALLES DE LA CUENTA SELECCIONADA */}
          {selectedBank && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Datos para el pago:</p>
                <div className="text-sm text-slate-700 font-mono space-y-1">
                   {selectedBank.account_number && <p>Cuenta: <span className="font-bold">{selectedBank.account_number}</span></p>}
                   {selectedBank.phone && <p>Teléfono: <span className="font-bold">{selectedBank.phone}</span></p>}
                   {selectedBank.email && <p>Email: <span className="font-bold">{selectedBank.email}</span></p>}
                   {selectedBank.id_number && <p>Doc: <span className="font-bold">{selectedBank.id_number}</span></p>}
                </div>
            </div>
          )}

          {isBs && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in shadow-sm">
              <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm font-bold text-xs border border-blue-100">BCV</div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase">Tasa del Día</p>
                <p className="text-sm text-blue-600">1 USD ≈ <span className="font-black text-lg">{TASA_BCV} Bs.</span></p>
              </div>
            </div>
          )}
        </div>

        {/* --- DERECHA: FORMULARIO DETALLE --- */}
        <div className="lg:col-span-5">
          <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8 space-y-5">
            
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Paso 2</span>
              Detalles del Comprobante
            </h3>

            {/* MONTO */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto Pagado</label>
              <div className="relative mt-1 group">
                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 font-bold text-lg outline-none focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* REFERENCIA */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nro. Referencia (últimos 6 dígitos)</label>
              <div className="relative mt-1 group">
                <DocumentTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                <input 
                  type="text" 
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="Ej: 123456"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* FECHA Y HORA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
                <div className="relative mt-1 group">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E33127]" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-[#E33127] text-slate-700 bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hora</label>
                <div className="relative mt-1 group">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E33127]" />
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full pl-9 pr-2 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-[#E33127] text-slate-700 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* COMPROBANTE */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Comprobante (Opcional)</label>
              <label className={`
                mt-1 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all group
                ${file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#E33127]'}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <div className="flex items-center gap-2 text-emerald-600 animate-in bounce-in">
                      <CheckBadgeIcon className="w-6 h-6" />
                      <div className="text-center">
                         <p className="text-sm font-bold text-emerald-700">Imagen cargada</p>
                         <p className="text-xs text-emerald-600/70 truncate max-w-[150px]">{file.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-8 h-8 text-slate-400 group-hover:text-[#E33127] mb-1 transition-colors" />
                      <p className="text-xs text-slate-500 font-medium group-hover:text-slate-700">Click para subir imagen</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E33127] hover:bg-[#c92a21] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-red-500/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                'REPORTAR PAGO'
              )}
            </button>

          </form>
        </div>

      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}