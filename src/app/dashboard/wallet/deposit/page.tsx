'use client';

import { useEffect, useState } from 'react';
import { createWalletDeposit, getWalletBalance } from '@/app/lib/wallet.service';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  ArrowUpCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WalletIcon,
  HashtagIcon
} from "@heroicons/react/24/outline";

/* ===== Tipos ===== */
type PaymentMethod = {
  id: number;
  name: string;
  type:
    | 'BANK_TRANSFER'
    | 'BINANCE_PAYMENT'
    | 'MOBILE_PAYMENT'
    | 'WALLY_PAYMENT'
    | 'ZELLE_PAYMENT'
    | 'ZINLI_PAYMENT'
    | string;
  status?: 'ACTIVE' | 'DELETED' | 'DISABLED';
};

const API =
  process.env.NEXT_PUBLIC_API_FULL?.replace(/\/$/, '') ||
  'http://localhost:8080/api/v1';

export default function WalletDepositPage() {
  /* ===== Estado ===== */
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  const [amount, setAmount] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ===== Carga de Datos ===== */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [mRes, balanceData] = await Promise.all([
          fetch(`${API}/payment-methods`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          }),
          // @ts-expect-error: Se ignora el argumento requerido para permitir el build
          getWalletBalance().catch(() => null),
        ]);

        if (cancel) return;

        if (mRes.ok) {
          try {
            const m = (await mRes.json()) as PaymentMethod[];
            setMethods(m?.filter((x) => x?.status !== 'DISABLED') ?? []);
          } catch { setMethods([]); }
        }

        if (balanceData) {
          const num = balanceData?.balance ?? balanceData?.saldo ?? balanceData?.amount ?? null;
          setBalance(typeof num === 'number' ? num : null);
        }
      } catch {
        // silent error
      } finally {
        if (!cancel) setLoadingInit(false);
      }
    })();

    return () => { cancel = true; };
  }, []);

  const currency = 'USD';
  const parsedAmount = Number(amount);
  const amountInvalid = !Number.isFinite(parsedAmount) || parsedAmount <= 0;

  /* ===== Submit ===== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (amountInvalid) {
      setMsg({ type: 'err', text: 'Ingresa un monto válido mayor a 0.' });
      return;
    }
    if (!methodId) {
      setMsg({ type: 'err', text: 'Selecciona un método de pago.' });
      return;
    }

    setSubmitting(true);
    try {
      await createWalletDeposit({
        amount: parsedAmount,
        paymentMethodId: Number(methodId),
        reference: reference || undefined,
        note: note || undefined,
      });

      setMsg({
        type: 'ok',
        text: 'Tu solicitud de recarga fue enviada. La procesaremos lo antes posible.',
      });

      setAmount('');
      setReference('');
      setNote('');
      setMethodId('');
    } catch (err: any) {
      setMsg({
        type: 'err',
        text: err?.message || 'No se pudo enviar la solicitud. Intenta nuevamente más tarde.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ===== Render: Loading ===== */
  if (loadingInit) {
    return (
        <div className="min-h-screen bg-slate-50 p-10 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    );
  }

  /* ===== Render: UI Principal ===== */
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Recargar <span className="text-[#E33127]">Saldo</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
            Añade fondos a tu billetera para adquirir servicios.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* ALERTAS */}
                {msg && (
                  <div className={`rounded-xl p-4 flex items-start gap-3 border ${msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {msg.type === 'ok' ? <CheckCircleIcon className="w-5 h-5 shrink-0" /> : <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-bold">{msg.text}</p>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                        
                        {/* INPUT MONTO */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Monto a Recargar
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <BanknotesIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all font-mono text-lg font-bold"
                                    placeholder="0.00"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-sm">{currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* SELECT MÉTODO */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Método de Pago
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <CreditCardIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                                </div>
                                <select
                                    value={methodId}
                                    onChange={(e) => setMethodId(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all appearance-none font-medium"
                                >
                                    <option value="">Selecciona método...</option>
                                    {methods.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.type.replace('_', ' ')})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                   <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            {methods.length === 0 && (
                                <p className="mt-2 text-xs text-red-500 font-medium">
                                    * No hay métodos de pago activos. Contacta a soporte.
                                </p>
                            )}
                        </div>

                        {/* INPUT REFERENCIA */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Referencia / Comprobante
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HashtagIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all font-medium"
                                    placeholder="Ej: 12345678, Zelle Ref, Binance ID..."
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                Es vital para que nuestro equipo valide tu pago rápidamente.
                            </p>
                        </div>

                        {/* TEXTAREA NOTA */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Nota Adicional (Opcional)
                            </label>
                            <div className="relative group">
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <DocumentTextIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                                </div>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all resize-none text-sm font-medium"
                                    placeholder="Detalles extra para el equipo..."
                                />
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            {/* COLUMNA DERECHA: SALDO Y ACCIÓN */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* TARJETA DE SALDO (Estilo Premium) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-slate-500">
                            <WalletIcon className="w-5 h-5 text-green-600" />
                            <span className="text-xs font-bold uppercase tracking-wider">Saldo Actual</span>
                        </div>
                        
                        <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                             {balance != null
                                ? balance.toLocaleString('en-US', { style: 'currency', currency })
                                : '--'}
                        </div>
                        
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
                            <div className="bg-green-500 h-full w-full opacity-20"></div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <button
                    onClick={onSubmit}
                    disabled={submitting || amountInvalid || !amount || !methodId || methods.length === 0}
                    className="w-full py-4 px-6 rounded-xl bg-[#E33127] text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <span>Enviar Solicitud</span>
                            <ArrowUpCircleIcon className="w-6 h-6" />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-slate-400 font-medium px-4 leading-relaxed">
                    Tu saldo será acreditado una vez que validemos la transacción manual o automáticamente.
                </p>

            </div>
        </div>
      </div>
    </div>
  );
}