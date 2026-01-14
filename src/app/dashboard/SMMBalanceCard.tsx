'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
    ExclamationCircleIcon, 
    ServerStackIcon,
    CloudIcon,          
    CurrencyDollarIcon, 
    WalletIcon
} from '@heroicons/react/24/outline';

type BalanceData = { balance: string; currency: string; error?: string };
const ALLOWED_ROLES = ['SUPERUSER', 'ADMIN'];

export default function SMMBalanceCard() {
    const { data: session, status } = useSession();
    // Recuperamos el token de forma segura
    const token = (session as any)?.accessToken || (session as any)?.user?.token || (session as any)?.token || null;
    const currentRole = session?.user?.role?.toUpperCase();
    const isAuthorized = ALLOWED_ROLES.includes(currentRole || '');

    const [firstLoad, setFirstLoad] = useState(true);
    const [loading, setLoading] = useState(false);    
    const [legionData, setLegionData] = useState<BalanceData | null>(null);
    const [danlipagosData, setDanlipagosData] = useState<BalanceData | null>(null);

    async function fetchBalances(silent = false) {
        if (!isAuthorized || !token) return;
        if (!silent) setLoading(true);

        const authHeaders = {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
        };
        
        try {
            // ✅ RUTAS ACTUALIZADAS: Ahora apuntan a /api/proxy/...
            // Esto coincide con la carpeta que acabamos de crear (src/app/api/proxy)
            const [resLegion, resDanlipagos] = await Promise.all([
                fetch('/api/proxy/marketing/balance', { cache: 'no-store', headers: authHeaders }),
                fetch('/api/proxy/danlipagos/balance', { cache: 'no-store', headers: authHeaders }) 
            ]);

            // --- PROCESAR LEGION (Marketing) ---
            if (resLegion.ok) {
                const data = await resLegion.json();
                const bal = data.balance ?? data.data?.balance ?? '0.00';
                setLegionData({ 
                    balance: bal, 
                    currency: 'USD', 
                    error: undefined 
                });
            } else {
                console.error("Error Legion:", resLegion.status);
                if (!legionData) setLegionData({ balance: '0.00', currency: 'USD', error: 'Error' });
            }

            // --- PROCESAR DANLIPAGOS ---
            if (resDanlipagos.ok) {
                try {
                    const data = await resDanlipagos.json();
                    const bal = data.balance ?? data.data?.balance ?? '0.00';
                    const cur = data.currency ?? 'VES';
                    setDanlipagosData({
                        balance: bal,
                        currency: cur,
                        error: undefined
                    });
                } catch(e) { 
                    if (!danlipagosData) setDanlipagosData({ balance: '0.00', currency: 'VES', error: 'JSON' });
                }
            } else {
                 console.error("Error Danli:", resDanlipagos.status);
                 if (!danlipagosData) setDanlipagosData({ balance: '0.00', currency: 'VES', error: `Err ${resDanlipagos.status}` });
            }

        } catch (e) {
            console.error("Error general fetching providers:", e);
        } finally {
            setLoading(false);
            setFirstLoad(false);
        }
    }

    // Auto-refresco
    useEffect(() => {
        if (status === 'authenticated' && isAuthorized && token) {
            fetchBalances(false);
            const intervalo = setInterval(() => fetchBalances(true), 15000); 
            return () => clearInterval(intervalo);
        }
    }, [status, isAuthorized, token]); 
    
    if (status === 'loading') return <SkeletonLoader />;
    if (!isAuthorized) return null; 

    return (
        <div className="h-full flex flex-col">
            {/* ENCABEZADO */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-red-50 to-white text-[#E33127] shadow-sm border border-red-100">
                        <ServerStackIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Finanzas</p>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                            Saldo Proveedor
                        </h2>
                    </div>
                </div>
            </div>

            {/* TARJETAS */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
                <WalletCard 
                    name="Legion SMM" 
                    amount={legionData?.balance} 
                    currency="USD"
                    loading={firstLoad}
                    error={legionData?.error}
                    icon={CloudIcon} 
                    accentColor="blue"
                />
                
                <WalletCard 
                    name="Danlipagos" 
                    amount={danlipagosData?.balance} 
                    currency="VES" 
                    loading={firstLoad}
                    error={danlipagosData?.error}
                    icon={CurrencyDollarIcon} 
                    accentColor="emerald"
                />
            </div>
            
            {/* PIE DE PÁGINA */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                    <WalletIcon className="w-3 h-3" />
                    Billetera Integrada
                </span>
                <span className={`flex items-center gap-1.5 ${loading ? "text-[#E33127]" : "text-green-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-[#E33127] animate-ping" : "bg-green-500"}`}></span>
                    {loading ? "Sincronizando..." : "En vivo"}
                </span>
            </div>
        </div>
    );
}

// --- UTILIDADES Y COMPONENTES VISUALES ---

const formatMoney = (amount: string | number | undefined, currency: string) => {
    const num = Number(amount || 0);
    if (isNaN(num)) return currency === 'VES' ? 'Bs 0.00' : '$0.00';
    if (currency === 'VES') return `Bs ${num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function WalletCard({ name, amount, currency, loading, error, icon: Icon, accentColor }: any) {
    const isUsd = currency === 'USD';
    const bgBadge = isUsd ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-100 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:from-red-50" />
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-[#E33127] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm transition-all duration-500`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-[#E33127] transition-colors">
                            {name}
                        </span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${bgBadge}`}>
                            {currency} Wallet
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-6 w-24 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-3 w-12 bg-slate-50 rounded animate-pulse ml-auto"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 mb-1">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Sin conexión</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-[#E33127] transition-colors">
                                {formatMoney(amount, currency).split(' ')[0]} 
                                <span className="text-lg ml-1">{formatMoney(amount, currency).split(' ')[1]}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="h-full flex flex-col p-2 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="space-y-2 py-1">
                        <div className="w-16 h-3 bg-slate-100 rounded animate-pulse" />
                        <div className="w-24 h-5 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <div className="h-20 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                <div className="h-20 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
            </div>
        </div>
    );
}