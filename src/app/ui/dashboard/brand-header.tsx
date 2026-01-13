'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import Image from "next/image"; 
import { 
    ArrowTrendingUpIcon, 
    BellIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

// 🔥 URL ASEGURADA
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/$/, "");

type Notification = {
    id: number;
    title: string;
    text: string;
    type: 'info' | 'alert' | 'success' | 'system';
    time: string;
};

type HeaderData = {
    balance: number;
    utilities: number;
    loading: boolean;
    notifications: Notification[]; 
};

interface BrandHeaderProps {
    toggleSidebar?: () => void;
}

export default function BrandHeader({ toggleSidebar }: BrandHeaderProps) {
    const { data: session, status } = useSession();
    
    // Estado
    const [data, setData] = useState<HeaderData>({ balance: 0, utilities: 0, loading: true, notifications: [] });
    const [showNotif, setShowNotif] = useState(false);
    
    const user = session?.user;
    const role = (user as any)?.role?.toUpperCase() || 'CLIENT'; 
    const isAdmin = role === 'ADMIN' || role === 'SUPERUSER';

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? "BUENOS DÍAS" : h < 18 ? "BUENAS TARDES" : "BUENAS NOCHES";
    };

    const getToken = () => (session as any)?.accessToken || (session as any)?.user?.token || null;

    // 🔥 FETCH DE DATOS
    const fetchData = useCallback(async (silent = false) => {
        const token = getToken();
        if (!token) return;

        if (!silent) setData(prev => ({ ...prev, loading: true }));
        
        try {
            const headers: HeadersInit = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };

            const promises = [fetch(`${API_BASE}/me`, { headers, cache: 'no-store' })];
            if (isAdmin) {
                promises.push(fetch(`${API_BASE}/reports/utilities`, { headers, cache: 'no-store' }));
            }

            const responses = await Promise.all(promises);
            const meRes = responses[0];
            const utilRes = isAdmin ? responses[1] : null;

            let newBalance = data.balance;
            
            if (meRes.ok) {
                const meJson = await meRes.json();
                newBalance = Number(meJson.balance || 0);
            }

            let newUtilities = 0;
            if (utilRes && utilRes.ok) { 
                const rJson = await utilRes.json().catch(() => ({}));
                newUtilities = Number(rJson.net_system_balance ?? rJson.utilities ?? 0);
            }

            setData({ ...data, balance: newBalance, utilities: newUtilities, loading: false });

        } catch (e) {
            console.error("Header Error:", e);
            if (!silent) setData(prev => ({ ...prev, loading: false }));
        }
    }, [session, isAdmin, data.balance]); // eslint-disable-line

    // 🔄 EFECTO
    useEffect(() => {
        if (status === 'authenticated') {
            fetchData(false);
            const interval = setInterval(() => fetchData(true), 10000); 
            return () => clearInterval(interval);
        }
    }, [status, fetchData]); 

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
    };

    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = { 'SUPERUSER': 'CEO', 'ADMIN': 'ADMIN', 'DISTRIBUTOR': 'PARTNER', 'CLIENT': 'CLIENTE' };
        return map[role] || 'USUARIO';
    }

    if (status !== 'authenticated') return <div className="h-20 bg-white animate-pulse border-b border-slate-100" />;

    return (
        // 1. FONDO INFINITO (Cubre toda la pantalla)
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
            
            {/* 2. CONTENEDOR CENTRAL */}
            <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                
                {/* ------------------------------- */}
                {/* 🟢 ZONA IZQUIERDA: IDENTIDAD    */}
                {/* ------------------------------- */}
                <div className="flex items-center gap-4 lg:gap-8 h-full">
                    
                    {/* Botón Móvil */}
                    <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bars3Icon className="w-6 h-6" />
                    </button>

                    {/* Logo + Texto */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative w-9 h-9 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105">
                            <Image src="/motostore-logo.png" alt="Logo" fill className="object-contain" priority />
                        </div>
                        <div className="hidden md:flex flex-col justify-center">
                            {/* 🔥 CAMBIO APLICADO: El span ahora hereda el color del padre */}
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-[#E33127] transition-colors">
                                Moto<span className="font-medium"> Store LLC</span>
                            </h1>
                        </div>
                    </div>
                    
                    {/* Separador */}
                    <div className="hidden xl:block w-px h-8 bg-slate-200"></div>

                    {/* Saludo */}
                    <div className="hidden xl:flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{getGreeting()}</span>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{user?.name || user?.username}</span>
                    </div>
                </div>

                {/* ------------------------------- */}
                {/* 🟢 ZONA DERECHA: FINANZAS       */}
                {/* ------------------------------- */}
                <div className="flex items-center gap-4 lg:gap-8 h-full">
                    
                    {/* 1. SALDO (El Protagonista) */}
                    <div className="flex flex-col items-end justify-center min-w-[110px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Saldo Disponible</span>
                        </div>
                        <span className={`text-xl md:text-3xl font-black tracking-tighter leading-none tabular-nums ${data.loading ? 'text-slate-300' : 'text-slate-900'}`}>
                            {data.loading ? '---' : formatMoney(data.balance)}
                        </span>
                    </div>
                    
                    {/* 2. UTILIDAD (Solo Admin) */}
                    {isAdmin && (
                        <div className="hidden 2xl:flex items-center gap-4 pl-6 border-l border-slate-100 h-10">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <ArrowTrendingUpIcon className="w-3 h-3 text-[#E33127]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Utilidad</span>
                                </div>
                                <span className={`text-xl font-black tracking-tighter leading-none tabular-nums ${data.loading ? 'text-slate-300' : 'text-[#E33127]'}`}>
                                    {data.loading ? '---' : formatMoney(data.utilities)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. ACCIONES */}
                    <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l md:border-slate-100">
                        
                        {/* Campana */}
                        <button 
                            onClick={() => setShowNotif(!showNotif)}
                            className="p-2.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 relative"
                        >
                            <BellIcon className="w-6 h-6" />
                            {data.notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#E33127] rounded-full border border-white"></span>
                            )}
                        </button>

                        {/* Perfil Compacto */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-900">{user?.username}</span>
                                <span className="text-[9px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {getRoleLabel(role)}
                                </span>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-sm md:text-lg shadow-md shadow-slate-200 ring-2 ring-white">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOTIFICACIONES FLOTANTES */}
                {showNotif && (
                    <div className="absolute right-4 md:right-8 top-20 w-[90vw] md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-4 overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h4 className="font-bold text-slate-800 text-sm">Notificaciones</h4>
                            <button onClick={() => setShowNotif(false)} className="text-[10px] font-bold text-[#E33127] hover:underline">CERRAR</button>
                        </div>
                        <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                            <BellIcon className="w-8 h-8 text-slate-200"/>
                            <span>No hay novedades recientes.</span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}















