'use client';

import { useState, useEffect } from 'react';
import { 
    ArrowPathIcon, 
    ArrowsRightLeftIcon, 
    GlobeAmericasIcon, 
    CloudIcon, 
    SignalSlashIcon,
    BoltIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------
// 🟢 CONEXIÓN DIRECTA A RENDER
// ---------------------------------------------------------
const API_URL = "https://motostore-api.onrender.com";

const COUNTRIES_CONFIG = [
    { code: 'VE', name: 'Venezuela', currency: 'VES', symbol: 'Bs', label: 'Tasa USDT (Manual)' }, // VE siempre manual
    { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', label: 'Tasa COP' },
    { code: 'PE', name: 'Perú', currency: 'PEN', symbol: 'S/', label: 'Tasa PEN' },
    { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', label: 'Tasa CLP' }
];

type RateData = {
    code: string;
    rate: number;
    isManual: boolean;
    label?: string;
};

export default function UpdateRatesForm({ initialRates, initialProfit }: { initialRates: RateData[]; initialProfit: number }) {
    const [rates, setRates] = useState<RateData[]>(initialRates);
    const [profit, setProfit] = useState(initialProfit);
    
    // Estados
    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
    const [fetchingAuto, setFetchingAuto] = useState(false);

    // 1. CARGAR DATOS REALES
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/exchange/config`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.rates) {
                        setRates(data.rates);
                        setProfit(data.profit);
                        setConnectionStatus("connected");
                    }
                } else {
                    setConnectionStatus("disconnected");
                }
            } catch (error) {
                console.error("Error conectando a Render:", error);
                setConnectionStatus("disconnected");
            } finally {
                setInitializing(false);
            }
        };
        fetchData();
    }, []);

    // 2. BUSCAR TASA AUTOMÁTICA EN INTERNET
    const fetchLiveRate = async (currencyCode: string) => {
        try {
            // Usamos una API pública gratuita para obtener el precio real del dólar
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            return data.rates[currencyCode];
        } catch (error) {
            console.error("Error buscando tasa en vivo:", error);
            alert("No se pudo conectar con el mercado mundial. Revise su internet.");
            return null;
        }
    };

    // 3. CAMBIAR MODO AUTO/MANUAL
    const toggleAutoMode = async (countryCode: string) => {
        // Venezuela no tiene modo automático en este caso (siempre USDT manual)
        if (countryCode === 'VE') return;

        const currentRate = rates.find(r => r.code === countryCode);
        if (!currentRate) return;

        const newIsManual = !currentRate.isManual;

        // Si cambiamos a AUTOMÁTICO, buscamos el precio real
        if (!newIsManual) {
            setFetchingAuto(true);
            const liveRate = await fetchLiveRate(COUNTRIES_CONFIG.find(c => c.code === countryCode)?.currency || '');
            setFetchingAuto(false);

            if (liveRate) {
                setRates(prev => prev.map(r => 
                    r.code === countryCode ? { ...r, rate: liveRate, isManual: false } : r
                ));
            }
        } else {
            // Si cambiamos a MANUAL, solo activamos el campo
            setRates(prev => prev.map(r => 
                r.code === countryCode ? { ...r, isManual: true } : r
            ));
        }
    };

    const handleRateChange = (countryCode: string, value: string) => {
        setRates(prev => prev.map(r => 
            r.code === countryCode ? { ...r, rate: parseFloat(value || '0'), isManual: true } : r
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/exchange/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rates, profit }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Error al guardar.");
            }
        } catch (error) {
            alert("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    const getSymbol = (code: string) => COUNTRIES_CONFIG.find(c => c.code === code)?.symbol || '$';

    if (initializing) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-3xl border shadow-lg animate-pulse">
                <GlobeAmericasIcon className="w-12 h-12 text-slate-300 mb-4 animate-bounce"/>
                <p className="text-slate-500 font-bold text-sm">Sincronizando Tasas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in duration-500">
            
            {/* INDICADOR DE CONEXIÓN */}
            <div className={`text-xs font-bold uppercase tracking-widest text-center py-2 rounded-lg border ${
                connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                'bg-red-50 text-red-600 border-red-200'
            }`}>
                {connectionStatus === 'connected' ? (
                    <span className="flex items-center justify-center gap-2"><CloudIcon className="w-4 h-4"/> ONLINE: DATOS REALES</span>
                ) : (
                    <span className="flex items-center justify-center gap-2"><SignalSlashIcon className="w-4 h-4"/> OFFLINE: REVISE CONEXIÓN</span>
                )}
            </div>

            {/* BANNER VISUAL */}
            <div className="rounded-3xl bg-white p-6 border-l-8 border-[#E33127] shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2">
                        <GlobeAmericasIcon className="w-6 h-6 text-[#E33127]"/> Pizarra Global
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rates.map((rate) => (
                        <div key={rate.code} className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${rate.isManual ? "bg-red-50 border-red-100" : "bg-sky-50 border-sky-100"}`}>
                             <div className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${rate.isManual ? 'bg-red-200 text-red-700' : 'bg-sky-200 text-sky-700'}`}>
                                {rate.isManual ? 'Manual' : 'Auto'}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-2">{rate.label || rate.code}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-500">{getSymbol(rate.code)}</span>
                                <span className={`text-2xl font-black ${rate.isManual ? 'text-[#E33127]' : 'text-sky-700'}`}>{rate.rate.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FORMULARIO DE EDICIÓN */}
            <form className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl" onSubmit={handleSubmit}>
                <h4 className="text-xl font-extrabold text-[#E33127] border-b pb-2 mb-4 flex items-center gap-2">
                    <ArrowsRightLeftIcon className="w-5 h-5"/> Ajuste de Proveedores
                </h4>
                
                <div className="space-y-4">
                    {rates.map((rateItem) => {
                         const config = COUNTRIES_CONFIG.find(c => c.code === rateItem.code);
                         const isVE = rateItem.code === 'VE';

                         return (
                            <div key={rateItem.code} className={`p-4 rounded-xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
                                rateItem.isManual ? 'border-slate-100 bg-white' : 'border-sky-100 bg-sky-50'
                            }`}>
                                <div className="flex-grow">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        {rateItem.label || config?.label} 
                                        {!rateItem.isManual && <span className="text-[10px] bg-sky-200 text-sky-800 px-2 rounded-full">AUTOMÁTICO</span>}
                                    </label>
                                    <div className="text-xs text-slate-400 font-medium">
                                        1 USD = {rateItem.rate} {config?.currency}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* INPUT DE PRECIO */}
                                    <input
                                        type="number"
                                        value={rateItem.rate.toString()}
                                        onChange={(e) => handleRateChange(rateItem.code, e.target.value)}
                                        disabled={!rateItem.isManual || fetchingAuto} // Se bloquea si es Automático
                                        className={`block w-32 rounded-lg border-2 p-2 text-right font-bold transition-colors ${
                                            rateItem.isManual 
                                            ? "border-slate-300 text-slate-900 focus:border-[#E33127]" 
                                            : "border-sky-200 bg-sky-100 text-sky-700 cursor-not-allowed"
                                        }`}
                                    />

                                    {/* BOTÓN TOGGLE (Solo para CO, PE, CL) */}
                                    {!isVE && (
                                        <button
                                            type="button"
                                            onClick={() => toggleAutoMode(rateItem.code)}
                                            disabled={fetchingAuto}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition-all ${
                                                rateItem.isManual 
                                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                                                : "bg-sky-500 text-white hover:bg-sky-600"
                                            }`}
                                        >
                                            {rateItem.isManual ? (
                                                <><PencilSquareIcon className="w-4 h-4"/> Manual</>
                                            ) : (
                                                <><BoltIcon className="w-4 h-4"/> Auto</>
                                            )}
                                        </button>
                                    )}
                                    
                                    {/* BOTÓN SOLO INDICADOR PARA VENEZUELA */}
                                    {isVE && (
                                        <span className="px-3 py-2 rounded-lg text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                                            Fijo Manual
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Margen de Utilidad (%)</label>
                        <input
                            type="number"
                            value={profit.toString()}
                            onChange={(e) => setProfit(parseFloat(e.target.value || '0'))}
                            className="block w-full rounded-lg border-2 border-slate-300 p-3 text-slate-900 focus:border-[#E33127]"
                        />
                     </div>
                    <button type="submit" disabled={loading} className="w-full py-4 rounded-xl shadow-lg text-sm font-black text-white bg-[#E33127] hover:bg-red-700 transition-all">
                        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" /> : (success ? "¡GUARDADO Y ACTUALIZADO!" : "GUARDAR CAMBIOS REALES")}
                    </button>
                </div>
            </form>
        </div>
    );
}