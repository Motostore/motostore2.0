'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  DevicePhoneMobileIcon, 
  ChevronLeftIcon, 
  ShieldCheckIcon, 
  BanknotesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';

// LISTA COMPLETA Y VERIFICADA DE OPERADORES
const ALL_SERVICES = [
  // --- VENEZUELA ---
  { label: "MOVILNET PRE", code: "movilnet", group: "Venezuela", color: "bg-red-600", flag: "🇻🇪" },
  { label: "MOVILNET VIP", code: "movilnetvip", group: "Venezuela", color: "bg-red-500", flag: "🇻🇪" },
  { label: "MOVILNET POS", code: "movilnetpos", group: "Venezuela", color: "bg-red-700", flag: "🇻🇪" },
  { label: "MOVISTAR PRE", code: "movistar", group: "Venezuela", color: "bg-sky-500", flag: "🇻🇪" },
  { label: "MOVISTAR POS", code: "movistarpos", group: "Venezuela", color: "bg-sky-700", flag: "🇻🇪" },
  { label: "DIGITEL PRE", code: "digitel", group: "Venezuela", color: "bg-red-600", flag: "🇻🇪" },
  { label: "DIGITEL POS", code: "digitelpos", group: "Venezuela", color: "bg-red-800", flag: "🇻🇪" },
  { label: "CANTV", code: "cantv", group: "Venezuela", color: "bg-blue-900", flag: "🇻🇪" },
  { label: "INTER", code: "interpos", group: "Venezuela", color: "bg-blue-400", flag: "🇻🇪" },
  { label: "SIMPLE TV", code: "simpletv", group: "Venezuela", color: "bg-slate-800", flag: "🇻🇪" },

  // --- COLOMBIA (Lista Completa) ---
  { label: "CLARO COL", code: "claro", group: "Colombia", color: "bg-red-600", flag: "🇨🇴" },
  { label: "MOVISTAR COL", code: "movistar_col", group: "Colombia", color: "bg-sky-500", flag: "🇨🇴" },
  { label: "TIGO COL", code: "tigo", group: "Colombia", color: "bg-blue-800", flag: "🇨🇴" },
  { label: "WOM COL", code: "wom", group: "Colombia", color: "bg-purple-600", flag: "🇨🇴" },
  { label: "VIRGIN COL", code: "virgin", group: "Colombia", color: "bg-gray-800", flag: "🇨🇴" },
  { label: "ETB COL", code: "etb", group: "Colombia", color: "bg-blue-400", flag: "🇨🇴" },

  // --- ECUADOR (Lista Completa) ---
  { label: "CLARO ECU", code: "claro_ec", group: "Ecuador", color: "bg-red-600", flag: "🇪🇨" },
  { label: "MOVISTAR ECU", code: "movistar_ec", group: "Ecuador", color: "bg-sky-500", flag: "🇪🇨" },
  { label: "CNT ECU", code: "cnt", group: "Ecuador", color: "bg-orange-500", flag: "🇪🇨" },
  { label: "TUENTI ECU", code: "tuenti_ec", group: "Ecuador", color: "bg-pink-600", flag: "🇪🇨" }
];

export default function RecargaTelefonicaPage() {
  const [operator, setOperator] = useState(ALL_SERVICES[0].code);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [amounts, setAmounts] = useState<number[]>([]);
  const [fetching, setFetching] = useState(false);
  const [checkingSaldo, setCheckingSaldo] = useState(false);
  const [saldoInfo, setSaldoInfo] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setFetching(true); setAmounts([]); setSaldoInfo(null);
      try {
        const res = await fetch(`/api/danli/montos?tipo=${operator}`);
        const d = await res.json();
        const raw = d?.montos || d?.data || (Array.isArray(d) ? d : []);
        const list = raw.map((m: any) => Number(m.monto || m.amount || m)).filter((n: number) => n > 0);
        setAmounts(list.sort((a: number, b: number) => a - b));
      } catch (e) { console.error("Error sync"); } 
      finally { setFetching(false); }
    }
    load();
  }, [operator]);

  const consultarSaldo = async () => {
    if (!phone) return toast.error("Ingresa el número");
    setCheckingSaldo(true);
    try {
      const res = await fetch(`/api/danli/montos?action=consulta&tipo=${operator}&numero=${phone}`);
      const data = await res.json();
      setSaldoInfo(data.mensaje || "Saldo actual: Bs. 0.00");
      toast.success("Consulta Exitosa");
    } catch (e) {
      toast.error("Error en consulta");
    } finally {
      setCheckingSaldo(false);
    }
  };

  const countries = [
    { name: "Venezuela", flag: "🇻🇪" },
    { name: "Colombia", flag: "🇨🇴" },
    { name: "Ecuador", flag: "🇪🇨" }
  ];

  const handleRecharge = async () => {
    if (!phone || !amount) return toast.error("Datos incompletos");
    const t = toast.loading("Procesando...");
    try {
        const res = await fetch('/api/danli/recarga', {
            method: 'POST',
            body: JSON.stringify({ tipo: operator, numero: phone, monto: amount })
        });
        const data = await res.json();
        if(data.success || data.ok) {
            toast.success("¡Recarga Exitosa!");
            setPhone(''); setAmount('');
        } else {
            toast.error(data.mensaje || "Error del proveedor");
        }
    } catch {
        toast.error("Error de conexión");
    } finally {
        toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-6 font-sans">
      <Toaster position="top-center" />
      
      {/* HEADER ROJO MOTO STORE (Compacto) */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-lg border-b-4 border-red-600">
        <Link href="/dashboard/products" className="flex items-center gap-2 text-slate-700 hover:text-red-600 font-black text-xs uppercase tracking-tighter transition-all">
          <ChevronLeftIcon className="w-4 h-4 text-red-600" /> Volver al Panel
        </Link>
        <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full shadow-md">
          <ShieldCheckIcon className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Moto Store Oficial</span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LISTADO DE PAÍSES */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {countries.map((country) => (
            <div key={country.name} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              
              {/* Título País Compacto */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-xl">{country.flag}</span>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">
                  {country.name}
                </p>
              </div>

              {/* Botones - Altura Reducida (h-14) */}
              <div className="grid grid-cols-3 gap-2">
                {ALL_SERVICES.filter(s => s.group === country.name).map(op => (
                  <button 
                    key={op.code} 
                    onClick={() => setOperator(op.code)} 
                    className={`flex items-center justify-center p-1 rounded-xl border-2 transition-all duration-200 h-14 ${
                      operator === op.code 
                      ? 'border-red-600 bg-red-50 shadow-inner' 
                      : 'border-slate-100 bg-white hover:border-red-200'
                    }`}
                  >
                    <img 
                      src={`/logos/${op.code}.png`} 
                      alt={op.label}
                      className="h-full w-auto object-contain pointer-events-none p-1"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FORMULARIO (Compacto) */}
        <div className="lg:col-span-7 sticky top-4">
          <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-slate-50">
            
            <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                  Moto <span className="text-red-600">Store</span>
                </h1>
                <div className="h-1.5 w-16 bg-red-600 mx-auto mt-2 rounded-full"></div>
            </div>
            
            <div className="space-y-5">
              {/* LÍNEA DE DESTINO */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-3">Línea de Destino</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                    <input 
                      type="tel" 
                      placeholder="Número / Contrato" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-red-600 focus:bg-white rounded-xl outline-none font-black text-lg text-slate-900 transition-all shadow-inner" 
                    />
                  </div>
                  {/* Botón Consultar Saldo SOLO Movilnet */}
                  {operator === 'movilnet' && (
                    <button 
                      onClick={consultarSaldo} 
                      disabled={checkingSaldo || !phone}
                      className="bg-slate-900 hover:bg-red-600 text-white w-14 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                    >
                      <MagnifyingGlassIcon className={`w-5 h-5 ${checkingSaldo ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
                {saldoInfo && (
                  <div className="bg-red-50 border border-red-100 p-2 rounded-xl text-center">
                    <p className="text-red-700 font-bold text-xs uppercase">{saldoInfo}</p>
                  </div>
                )}
              </div>

              {/* MONTO */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-3">Monto a Recargar</label>
                <div className="relative group">
                  <BanknotesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                  <select 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))} 
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-100 focus:border-red-600 focus:bg-white rounded-xl outline-none font-black text-lg appearance-none cursor-pointer text-slate-900 transition-all shadow-inner"
                  >
                    <option value="">{fetching ? 'Buscando...' : '-- Seleccionar Bs. --'}</option>
                    {amounts.map(m => (
                      <option key={m} value={m}>Bs. {m.toLocaleString('es-VE')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BOTÓN CONFIRMAR */}
              <button 
                onClick={handleRecharge}
                disabled={!amount || !phone || fetching || checkingSaldo} 
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-lg active:scale-95 duration-300 disabled:opacity-20 mt-2"
              >
                {fetching ? 'Procesando...' : 'Confirmar Recarga'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}