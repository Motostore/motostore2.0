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

// LISTA DE OPERADORES (Se respetará mayúsculas/minúsculas)
const ALL_SERVICES = [
  // --- VENEZUELA ---
  { label: "Movilnet Prepago", code: "movilnet", group: "Venezuela", flag: "🇻🇪" },
  { label: "Movilnet VIP", code: "movilnetvip", group: "Venezuela", flag: "🇻🇪" },
  { label: "Movilnet Pospago", code: "movilnetpos", group: "Venezuela", flag: "🇻🇪" },
  { label: "Movistar Prepago", code: "movistar", group: "Venezuela", flag: "🇻🇪" },
  { label: "Movistar Pospago", code: "movistarpos", group: "Venezuela", flag: "🇻🇪" },
  { label: "Digitel Prepago", code: "digitel", group: "Venezuela", flag: "🇻🇪" },
  { label: "Digitel POS", code: "digitelpos", group: "Venezuela", flag: "🇻🇪" },
  { label: "Cantv", code: "cantv", group: "Venezuela", flag: "🇻🇪" },
  { label: "Inter", code: "interpos", group: "Venezuela", flag: "🇻🇪" },
  { label: "Simple TV", code: "simpletv", group: "Venezuela", flag: "🇻🇪" },

  // --- COLOMBIA ---
  { label: "Claro Colombia", code: "claro", group: "Colombia", flag: "🇨🇴" },
  { label: "Movistar Colombia", code: "movistar_col", group: "Colombia", flag: "🇨🇴" },
  { label: "Tigo Colombia", code: "tigo", group: "Colombia", flag: "🇨🇴" },
  { label: "WOM Colombia", code: "wom", group: "Colombia", flag: "🇨🇴" },
  { label: "Virgin Colombia", code: "virgin", group: "Colombia", flag: "🇨🇴" },
  { label: "ETB Colombia", code: "etb", group: "Colombia", flag: "🇨🇴" },

  // --- ECUADOR ---
  { label: "Claro Ecuador", code: "claro_ec", group: "Ecuador", flag: "🇪🇨" },
  { label: "Movistar Ecuador", code: "movistar_ec", group: "Ecuador", flag: "🇪🇨" },
  { label: "CNT Ecuador", code: "cnt", group: "Ecuador", flag: "🇪🇨" },
  { label: "TUENTI Ecuador", code: "tuenti_ec", group: "Ecuador", flag: "🇪🇨" }
];

// Helper Inteligente para Logos
const getLogo = (code: string) => {
  const c = code.toLowerCase();
  if (c.includes('movilnet')) return '/logos/movilnet.png';
  if (c.includes('movistar')) return '/logos/movistar.png';
  if (c.includes('digitel')) return '/logos/digitel.png';
  if (c.includes('cantv')) return '/logos/cantv.png';
  if (c.includes('inter')) return '/logos/inter.png';
  if (c.includes('simple')) return '/logos/simpletv.png';
  if (c.includes('claro')) return '/logos/claro.png';
  if (c.includes('tigo')) return '/logos/tigo.png';
  if (c.includes('wom')) return '/logos/wom.png';
  if (c.includes('etb')) return '/logos/etb.png'; 
  return `/logos/${code}.png`; 
};

export default function RecargaTelefonicaPage() {
  const [operator, setOperator] = useState(ALL_SERVICES[0].code);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [amounts, setAmounts] = useState<number[]>([]);
  const [fetching, setFetching] = useState(false);
  const [checkingSaldo, setCheckingSaldo] = useState(false);
  const [saldoInfo, setSaldoInfo] = useState<string | null>(null);

  // ESTADO PARA EL NOMBRE BONITO DEL OPERADOR SELECCIONADO
  const selectedOpLabel = ALL_SERVICES.find(s => s.code === operator)?.label || operator;

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
      
      {/* HEADER ROJO MOTO STORE */}
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
        
        {/* LISTADO DE PAÍSES Y OPERADORES */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {countries.map((country) => (
            <div key={country.name} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-xl">{country.flag}</span>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">
                  {country.name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ALL_SERVICES.filter(s => s.group === country.name).map(op => (
                  <button 
                    key={op.code} 
                    onClick={() => setOperator(op.code)} 
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 h-20 ${
                      operator === op.code 
                      ? 'border-red-600 bg-red-50 shadow-inner ring-2 ring-red-100' 
                      : 'border-slate-100 bg-white hover:border-red-200'
                    }`}
                  >
                    {/* LOGO ARRIBA */}
                    <img 
                      src={getLogo(op.code)} 
                      alt={op.label}
                      className="h-8 w-auto object-contain pointer-events-none mb-1"
                      onError={(e) => (e.currentTarget.src = '/logos/default.png')}
                    />
                    {/* NOMBRE COMPLETO ABAJO - SIN UPPERCASE */}
                    <span className={`text-[9px] font-bold leading-tight text-center ${operator === op.code ? 'text-red-700' : 'text-slate-500'}`}>
                      {op.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="lg:col-span-7 sticky top-4">
          <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-slate-50">
            
            {/* ENCABEZADO DINÁMICO (LOGO + NOMBRE COMPLETO SELECCIONADO) */}
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-slate-200 flex items-center justify-center p-4 mb-2 border border-slate-100">
                    <img
                      src={getLogo(operator)}
                      alt={selectedOpLabel}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* AQUÍ SALE EL NOMBRE COMPLETO - SIN UPPERCASE */}
                  <h2 className="text-xl font-black text-slate-800 tracking-tighter text-center">
                    {selectedOpLabel}
                  </h2>
                  <div className="h-1 w-12 bg-red-600 rounded-full mt-2" />
                </div>
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
                  {operator.includes('movilnet') && (
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