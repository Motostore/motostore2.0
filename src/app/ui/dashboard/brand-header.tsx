// src/components/dashboard/brand-header.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import Image from "next/image"; 
import { 
    RocketLaunchIcon, 
    UserIcon, 
    WalletIcon,
    BellIcon,
    MegaphoneIcon, // Icono para anuncios del Jefe (Superuser)
    ExclamationCircleIcon,
    CheckBadgeIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

// Estructura de una Notificación
type Notification = {
    id: number;
    title: string;
    text: string;
    type: 'info' | 'alert' | 'success' | 'system'; // 'system' son los mensajes del Superuser
    time: string;
};

type HeaderData = {
    balance: number;
    utilities: number;
    loading: boolean;
    notifications: Notification[]; 
};

export default function DashboardHeader() {
    const { data: session, status } = useSession();
    
    // Estado
    const [data, setData] = useState<HeaderData>({ balance: 0, utilities: 0, loading: true, notifications: [] });
    const [showNotif, setShowNotif] = useState(false);
    
    const user = session?.user;
    const role = user?.role?.toUpperCase() || 'CLIENT';
    const isAdmin = role === 'ADMIN' || role === 'SUPERUSER';

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? "Buenos Días" : h < 18 ? "Buenas Tardes" : "Buenas Noches";
    };

    // --- CEREBRO DE NOTIFICACIONES EN CASCADA ---
    const getNotificationsByRole = (role: string): Notification[] => {
        
        // 1. ANUNCIOS GLOBALES (El Superuser habla, todos escuchan)
        // Esto vendría del backend como "System Broadcasts"
        const globalAnnouncements: Notification[] = [
            { 
                id: 999, 
                title: "Tasa Actualizada", 
                text: "El sistema opera hoy a 65.85 Bs/USD.", 
                type: 'system', 
                time: 'Hace 20 min' 
            }
        ];

        // 2. FILTRO POR JERARQUÍA
        if (role === 'SUPERUSER' || role === 'ADMIN') {
            return [
                { id: 1, title: "Nuevo Usuario", text: "Se ha registrado 'PedroPerez' hace un momento.", type: 'success', time: 'Hace 2 min' },
                { id: 2, title: "Pagos Pendientes", text: "Hay 3 reportes de Binance por verificar.", type: 'alert', time: 'Hace 45 min' },
                ...globalAnnouncements // Los admins también ven los anuncios del sistema
            ];
        }

        if (role === 'DISTRIBUTOR') {
            return [
                ...globalAnnouncements, // Reciben la info del jefe
                { id: 3, title: "Stock Bajo", text: "Atención: Quedan pocas pantallas de Disney+.", type: 'alert', time: 'Hace 1 hora' },
                { id: 4, title: "Comisión Generada", text: "Tu sub-usuario realizó una venta. Ganaste $0.50.", type: 'success', time: 'Hace 3 horas' }
            ];
        }

        // CLIENTES (Rol más bajo)
        return [
            ...globalAnnouncements, // Reciben la info del jefe
            { id: 5, title: "¡Oferta Flash!", text: "Recargas de Movistar con 5% de descuento.", type: 'info', time: 'Hace 4 horas' },
            { id: 6, title: "Bienvenido", text: "Gracias por unirte a la plataforma líder.", type: 'success', time: 'Hace 1 día' }
        ];
    };

    const getToken = () => (session as any)?.accessToken || (session as any)?.user?.token || null;

    const fetchData = async (silent = false) => {
        const token = getToken();
        if (!token) return;

        if (!silent) setData(prev => ({ ...prev, loading: true }));
        
        try {
            const headers: HeadersInit = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };

            // Fetch de datos financieros
            const [walletRes, reportsRes] = await Promise.all([
                fetch(`${API_BASE}/wallet/me`, { headers, cache: 'no-store' }),
                fetch(`${API_BASE}/reports/utilities`, { headers, cache: 'no-store' })
            ]);

            let balance = 0;
            if (walletRes.ok) {
                const wJson = await walletRes.json().catch(() => ({}));
                balance = Number(wJson.balance ?? wJson.data?.balance ?? 0);
            }

            let utilities = 0;
            if (reportsRes.ok) { 
                const rJson = await reportsRes.json().catch(() => ({}));
                utilities = Number(rJson.net_system_balance ?? rJson.utilities ?? 0);
            }

            // Calculamos las notificaciones según el rol actual
            const myNotifs = getNotificationsByRole(role);

            setData({ balance, utilities, loading: false, notifications: myNotifs });

        } catch (e) {
            console.error("Error header:", e);
            if (!silent) setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData(false);
            const interval = setInterval(() => fetchData(true), 15000);
            return () => clearInterval(interval);
        }
    }, [status, role]); 

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
    };

    const getRoleName = (role: string) => {
        if (role === 'SUPERUSER') return 'Superuser';
        if (role === 'ADMIN') return 'Administrador';
        if (role === 'DISTRIBUTOR') return 'Distribuidor';
        if (role === 'CLIENT') return 'Cliente';
        return 'Usuario';
    }

    if (status !== 'authenticated') return (
        <div className="flex justify-center items-center h-[80px] bg-white border-b border-slate-100 shadow-sm text-slate-400">
            Cargando...
        </div>
    );

    return (
        <div className="flex items-center justify-between w-full h-[80px] px-4 lg:px-6 py-2 bg-white border-b border-slate-100 shadow-sm relative">
            
            {/* IZQUIERDA: Identidad */}
            <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 lg:w-10 lg:h-10 hover:scale-105 transition-transform duration-300">
                        <Image src="/motostore-logo.png" alt="Logo" fill className="object-contain" priority />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight leading-none">Moto Store</h1>
                        <span className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">Soluciones Digitales</span>
                    </div>
                </div>
                <div className="hidden xl:flex flex-col text-sm text-slate-500 border-l border-slate-200 pl-4">
                    <span className="font-bold text-slate-800 tracking-wide">{getGreeting()}</span>
                </div>
            </div>

            {/* DERECHA: Panel de Control */}
            <div className="flex items-center gap-4 lg:gap-6">
                
                {/* Saldo */}
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <WalletIcon className="w-5 h-5 text-emerald-500"/>
                    <span className="hidden lg:inline">Saldo:</span> 
                    <span className="text-base lg:text-lg font-black text-slate-900">
                        {data.loading ? '...' : formatMoney(data.balance)}
                    </span>
                </div>
                
                {/* Utilidades (Solo Admin) */}
                {isAdmin && (
                    <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-700">
                        <RocketLaunchIcon className="w-5 h-5 text-[#E33127]"/>
                        <span className="hidden xl:inline">Utilidades:</span> 
                        <span className="text-lg font-black text-slate-900">
                            {data.loading ? '...' : formatMoney(data.utilities)}
                        </span>
                    </div>
                )}

                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                {/* 🔔 SISTEMA DE NOTIFICACIONES */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotif(!showNotif)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#E33127] transition-colors relative group"
                        title="Notificaciones"
                    >
                        <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        {data.notifications.length > 0 && (
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E33127] text-[8px] text-white flex items-center justify-center font-bold"></span>
                            </span>
                        )}
                    </button>

                    {/* Dropdown Cascada */}
                    {showNotif && (
                        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black/5">
                            {/* Header del Dropdown */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                                <h4 className="font-bold text-slate-800 text-sm">Notificaciones</h4>
                                <span className="text-[10px] bg-red-50 border border-red-100 text-[#E33127] px-2 py-0.5 rounded-full font-bold">
                                    {data.notifications.length} Nuevas
                                </span>
                            </div>
                            
                            {/* Lista */}
                            <div className="max-h-80 overflow-y-auto">
                                {data.notifications.length > 0 ? (
                                    data.notifications.map((notif) => (
                                        <div key={notif.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer last:border-0 group">
                                            {/* Icono inteligente según el tipo */}
                                            <div className={`
                                                mt-1 p-2 rounded-full h-fit shrink-0 transition-colors
                                                ${notif.type === 'system' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : ''}
                                                ${notif.type === 'alert' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-100' : ''}
                                                ${notif.type === 'success' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : ''}
                                                ${notif.type === 'info' ? 'bg-slate-100 text-slate-600 group-hover:bg-slate-200' : ''}
                                            `}>
                                                {notif.type === 'system' && <MegaphoneIcon className="w-4 h-4" />}
                                                {notif.type === 'alert' && <ExclamationCircleIcon className="w-4 h-4" />}
                                                {notif.type === 'success' && <UserIcon className="w-4 h-4" />}
                                                {notif.type === 'info' && <CurrencyDollarIcon className="w-4 h-4" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-bold ${notif.type === 'system' ? 'text-blue-700' : 'text-slate-800'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 px-4 text-center text-slate-400">
                                        <BellIcon className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                                        <p className="text-sm font-medium">Todo está tranquilo</p>
                                        <p className="text-xs">No tienes notificaciones pendientes.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                                <button className="text-xs font-bold text-[#E33127] hover:underline" onClick={() => setShowNotif(false)}>
                                    Marcar todo como leído
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rol (Solo icono en móvil) */}
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <UserIcon className="w-4 h-4 text-slate-400"/>
                    <span className="font-bold text-slate-900">{getRoleName(role || 'CLIENT')}</span>
                </div>
            </div>
        </div>
    );
}


















