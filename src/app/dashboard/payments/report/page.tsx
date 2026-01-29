"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react"; // 1. Importamos la sesión
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

// 2. CORRECCIÓN: Usamos la misma variable que en los reportes
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";

// Mapa de Iconos
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
  const { data: session } = useSession(); // Hook de sesión

  // ESTADO
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  // FORMULARIO
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(""); // Se llena en useEffect para evitar error de hidratación
  const [time, setTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const TASA_BCV = 65.50; // Ojo: Idealmente esto debería venir del backend

  // 3. Obtener Token Seguro
  const token = useMemo(() => {
    if (!session?.user) return null;
    return (session as any).accessToken || (session.user as any).token || null;
  }, [session]);

  // Evitar errores de hidratación con fechas
  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 5));
  }, []);

  // --- 4. CARGAR MÉTODOS (CON TOKEN) ---
  useEffect(() => {
    if (!token) return; // Esperamos a tener token

    fetch(`${API_BASE}/payment-methods`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Header de Auth Agregado
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error cargando bancos");
        return res.json();
      })
      .then(data => {
        // Aseguramos que sea un array (por si el backend devuelve { data: [...] })
        const list = Array.isArray(data) ? data : data.data || [];
        setBanks(list);
        setLoadingBanks(false);
      })
      .catch(err => {
        console.error("Error:", err);
        // No mostramos toast de error al inicio para no molestar si está cargando sesión
        setLoadingBanks(false);
      });
  }, [token]); // Se ejecuta cuando llega el token

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!token) return toast.error("No hay sesión activa");
    if (!selectedBankId) return toast.error("Selecciona un banco");
    if (!amount) return toast.error("Ingresa el monto");
    if (!reference) return toast.error("Ingresa la referencia");

    setLoading(true);
    const toastId = toast.loading("Procesando reporte...");
    
    const bankObj = banks.find(b => b.id === selectedBankId);

    try {
      const fd = new FormData();
      // Ajusta estos nombres según lo que espere tu backend (FastAPI suele usar 'payment_method_id')
      fd.append("payment_method_id", String(selectedBankId)); 
      fd.append("method_name", bankObj?.name || "Desconocido"); 
      fd.append("amount", amount);
      fd.append("reference", reference);
      fd.append("date_transaction", `${date} ${time}`);
      fd.append("status", "PENDING");
      fd.append("note", `Ref: ${reference} - Banco: ${bankObj?.bank_name || bankObj?.type}`);
      
      if (file) {
        // Nota: En FastAPI usualmente se espera "file" o "image", revisa tu backend
        fd.append("file", file); 
      }

      // 5. POST CON TOKEN
      const endpoint = `${API_BASE}/transactions/deposit`; // Ruta estándar de depósitos
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO poner 'Content-Type': 'multipart/form-data', fetch lo pone solo con el boundary correcto
        },
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al procesar el pago");
      }

      toast.success("¡Pago enviado a revisión!", { id: toastId });
      
      // Reset
      setAmount("");
      setReference("");
      setFile(null);
      setSelectedBankId(null);

    } catch (error: any) {
      console.error(error);
      toast.error("Error al reportar: Verifique los datos", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const isBs = selectedBank?.type === 'MOBILE_PAYMENT' || selectedBank?.type === 'BANK_TRANSFER';

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
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
        
        {/* --- IZQUIERDA: SELECTOR --- */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Paso 1</span>
            Selecciona el método
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
                           onError={(e) => { e.currentTarget.style.display = 'none'; }} // Fallback si falla imagen
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

          {/* DETALLES DE LA CUENTA */}
          {selectedBank && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase">Datos para transferir</p>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(selectedBank.account_number); toast.success("Cuenta copiada") }}
                        className="text-[10px] text-[#E33127] font-bold hover:underline cursor-pointer"
                    >
                        Copiar Datos
                    </button>
                </div>
                <div className="text-sm text-slate-700 font-mono space-y-1">
                   {selectedBank.bank_name && <p>Banco: <span className="font-bold text-slate-900">{selectedBank.bank_name}</span></p>}
                   {selectedBank.account_number && <p>Cuenta/Tlf: <span className="font-bold text-slate-900 bg-white px-1 rounded border border-slate-200 select-all">{selectedBank.account_number}</span></p>}
                   {selectedBank.id_number && <p>Cédula/RIF: <span className="font-bold text-slate-900">{selectedBank.id_number}</span></p>}
                   {selectedBank.email && <p>Correo: <span className="font-bold text-slate-900">{selectedBank.email}</span></p>}
                   {selectedBank.titular && <p>Titular: <span className="font-bold text-slate-900">{selectedBank.titular}</span></p>}
                </div>
            </div>
          )}

          {isBs && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in shadow-sm">
              <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm font-bold text-xs border border-blue-100">BCV</div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase">Tasa Estimada</p>
                <p className="text-sm text-blue-600">1 USD ≈ <span className="font-black text-lg">{TASA_BCV} Bs.</span></p>
              </div>
            </div>
          )}
        </div>

        {/* --- DERECHA: FORMULARIO --- */}
        <div className="lg:col-span-5">
          <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8 space-y-5">
            
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Paso 2</span>
              Datos del Comprobante
            </h3>

            {/* MONTO */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto Exacto</label>
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
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referencia (Últimos 6 dígitos)</label>
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

            {/* UPLOAD FILE */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Captura de Pantalla</label>
              <label className={`
                mt-1 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all group
                ${file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#E33127]'}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <div className="flex items-center gap-2 text-emerald-600 animate-in bounce-in">
                      <CheckBadgeIcon className="w-6 h-6" />
                      <div className="text-center">
                         <p className="text-sm font-bold text-emerald-700">Imagen lista</p>
                         <p className="text-[10px] text-emerald-600/70 truncate max-w-[150px]">{file.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-8 h-8 text-slate-400 group-hover:text-[#E33127] mb-1 transition-colors" />
                      <p className="text-xs text-slate-500 font-medium group-hover:text-slate-700">Subir Comprobante</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedBankId}
              className="w-full bg-[#E33127] hover:bg-[#c92a21] text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-red-500/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
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