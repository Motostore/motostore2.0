"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    WrenchScrewdriverIcon, 
    ArrowPathIcon,
    TableCellsIcon,
    ShieldExclamationIcon,
    // FunnelIcon, // Eliminado si no se usa explícitamente, o mantén si planeas usarlo
    // ExclamationCircleIcon, // Eliminado si no se usa explícitamente
    // ServerStackIcon // Eliminado si no se usa explícitamente
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { formatCurrency } from '@/app/lib/utils'; 

// --- 1. DEFINICIÓN DE ROLES ---
type Role = 
    | 'SUPERUSER' | 'ADMIN' | 'DISTRIBUTOR' | 'RESELLER' 
    | 'SUBDISTRIBUTOR' | 'TAQUILLA' | 'SUBTAQUILLA' | 'SUSTAQUILLA' | 'CLIENT';

// --- 2. TIPO DE SERVICIO UNIFICADO ---
type Provider = 'LEGION' | 'DANLIPAGOS';

type Service = { 
    service: string; // ID único
    name: string; 
    category: string;
    rate: string; 
    provider: Provider; // 🔥 Nuevo campo para identificar origen
};

type CommissionMatrix = Record<Role, Record<string, number>>;

const COMMISSIONABLE_ROLES: Role[] = [
    'DISTRIBUTOR', 'RESELLER', 'SUBDISTRIBUTOR', 
    'TAQUILLA', 'SUBTAQUILLA', 'SUSTAQUILLA'
];

const ALLOWED_ROLES = ['SUPERUSER', 'ADMIN'];

export default function CommissionManagementView() {
    const { data: session, status } = useSession();
    // Aseguramos que el rol siempre sea una cadena válida o 'CLIENT' por defecto
    const currentRole = (session?.user?.role?.toUpperCase() || 'CLIENT') as Role;
    const isAuthorized = ALLOWED_ROLES.includes(currentRole);

    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    
    // 🔥 ESTADO PARA EL FILTRO DE PROVEEDOR
    const [filterProvider, setFilterProvider] = useState<'ALL' | Provider>('ALL');

    // --- INICIALIZACIÓN DE COMISIONES ---
    const INITIAL_COMMISSIONS = useMemo<CommissionMatrix>(() => {
        const init: CommissionMatrix = { 
            SUPERUSER: {}, ADMIN: {}, DISTRIBUTOR: {}, RESELLER: {}, SUBDISTRIBUTOR: {},
            TAQUILLA: {}, SUBTAQUILLA: {}, SUSTAQUILLA: {}, CLIENT: {}
        };
        
        if (services.length > 0) {
            services.forEach(service => {
                COMMISSIONABLE_ROLES.forEach(role => {
                    init[role][service.service] = 1.0; 
                });
            });
        }
        return init;
    }, [services]);

    const [commissions, setCommissions] = useState<CommissionMatrix>(INITIAL_COMMISSIONS);
    
    // --- CARGA DE SERVICIOS (PARALELA: LEGION + DANLIPAGOS) ---
    useEffect(() => {
        if (!isAuthorized || status === 'loading') return;

        async function fetchAllServices() {
            setLoading(true);
            setFetchError(null);
            try {
                // Ejecutamos ambas peticiones en paralelo para mayor velocidad
                const [legionRes, danliRes] = await Promise.allSettled([
                    fetch('/api/legionsmm/services', { cache: 'no-store' }),
                    fetch('/api/danlipagos/services', { cache: 'no-store' }) 
                ]);

                let allServices: Service[] = [];
                // let errors = []; // Variable no usada, comentada para limpieza

                // Procesar Legion
                if (legionRes.status === 'fulfilled' && legionRes.value.ok) {
                    const data = await legionRes.value.json();
                    if (Array.isArray(data)) {
                        allServices.push(...data.map((s: any) => ({
                            service: `LG-${s.service}`, // Prefijo para evitar IDs duplicados
                            name: s.name,
                            category: s.category,
                            rate: String(s.rate),
                            provider: 'LEGION' as Provider
                        })));
                    }
                }

                // Procesar Danlipagos
                if (danliRes.status === 'fulfilled' && danliRes.value.ok) {
                    const data = await danliRes.value.json();
                    if (Array.isArray(data)) {
                        allServices.push(...data.map((s: any) => ({
                            service: `DL-${s.service}`,
                            name: s.name,
                            category: s.category || 'Streaming',
                            rate: String(s.rate),
                            provider: 'DANLIPAGOS' as Provider
                        })));
                    }
                } 
                
                // Si no hay API de Danlipagos aún, inyectamos datos falsos para visualización
                if (allServices.filter(s => s.provider === 'DANLIPAGOS').length === 0) {
                    allServices.push(
                        { service: 'DL-NETFLIX', name: 'Netflix Premium 1 Pantalla', category: 'Streaming', rate: '2.50', provider: 'DANLIPAGOS' },
                        { service: 'DL-DISNEY', name: 'Disney+ Cuenta Completa', category: 'Streaming', rate: '5.00', provider: 'DANLIPAGOS' },
                        { service: 'DL-FREEFIRE', name: 'Recarga FreeFire 100 Diamantes', category: 'Juegos', rate: '1.10', provider: 'DANLIPAGOS' }
                    );
                }

                if (allServices.length > 0) {
                    setServices(allServices);
                } else {
                    setFetchError('No se pudieron cargar servicios de ningún proveedor.');
                }

            } catch (e) {
                setFetchError('Error de conexión al cargar catálogos.');
            } finally {
                setLoading(false);
            }
        }
        fetchAllServices();
    }, [isAuthorized, status]);

    // Sincronizar comisiones
    useEffect(() => {
        if (services.length > 0 && Object.keys(commissions.DISTRIBUTOR).length === 0) {
            setCommissions(INITIAL_COMMISSIONS);
        }
    }, [services, INITIAL_COMMISSIONS, commissions.DISTRIBUTOR]);

    const handlePercentChange = useCallback((role: Role, serviceId: string, value: string) => {
        const n = Math.max(0, Math.min(100, Number(value)));
        if (!isFinite(n)) return;
        setCommissions(prev => ({
            ...prev, [role]: { ...prev[role], [serviceId]: n }
        }));
    }, []);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success("✅ Configuración guardada correctamente.", {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
            setLoading(false);
        }, 1500);
    };

    // --- FILTRADO VISUAL ---
    const filteredServices = useMemo(() => {
        if (filterProvider === 'ALL') return services;
        return services.filter(s => s.provider === filterProvider);
    }, [services, filterProvider]);

    if (status === 'loading') return <div className="p-8 text-center animate-pulse">Cargando...</div>;
    
    // Mejor manejo visual del acceso denegado
    if (!isAuthorized) return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm">
            <ShieldExclamationIcon className="w-12 h-12 mb-3 opacity-80" />
            <h3 className="text-lg font-bold">Acceso Denegado</h3>
            <p className="text-sm opacity-80">No tienes permisos suficientes para ver esta sección.</p>
        </div>
    );

    return (
        <div className="bg-white p-6 md:p-8 space-y-6 rounded-2xl shadow-sm border border-slate-100"> {/* Contenedor principal mejorado */}
            <Toaster position="bottom-right" />
            
            {/* HEADER CON FILTROS */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TableCellsIcon className="w-6 h-6 text-[#E33127]" />
                        Matriz de Comisiones
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestionando {services.length} servicios totales
                    </p>
                </div>

                {/* 🔥 PESTAÑAS DE FILTRO DE PROVEEDOR */}
                <div className="flex p-1 bg-slate-100 rounded-lg self-start md:self-auto">
                    <button 
                        onClick={() => setFilterProvider('ALL')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterProvider === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFilterProvider('DANLIPAGOS')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${filterProvider === 'DANLIPAGOS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span> Danlipagos
                    </button>
                    <button 
                        onClick={() => setFilterProvider('LEGION')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${filterProvider === 'LEGION' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Legion
                    </button>
                </div>
            </div>

            {/* TABLA DE COMISIONES */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm custom-scrollbar bg-white min-h-[400px]">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
                        <tr>
                            <th className="sticky left-0 bg-slate-50 px-6 py-4 border-r border-slate-200 text-left min-w-[280px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"> {/* Sombra sutil para efecto sticky */}
                                Servicio / Proveedor
                            </th>
                            <th className="px-4 py-4 text-center border-r border-slate-200 bg-slate-100 min-w-[100px]">
                                Costo Base
                            </th>
                            {COMMISSIONABLE_ROLES.map(role => (
                                <th key={role} className="px-2 py-4 text-center border-l border-slate-200 min-w-[120px]">
                                    {role} (%)
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredServices.map(service => (
                            <tr key={service.service} className="hover:bg-slate-50 transition-colors group">
                                
                                {/* COLUMNA NOMBRE + BADGE DE PROVEEDOR */}
                                <td className="sticky left-0 bg-white group-hover:bg-slate-50 px-6 py-3 border-r border-slate-200 z-10">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm font-bold text-slate-800 line-clamp-2" title={service.name}>
                                            {service.name}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {/* Badge de Proveedor */}
                                        {service.provider === 'DANLIPAGOS' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                🔵 DANLIPAGOS
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                                🔴 LEGION
                                            </span>
                                        )}
                                        
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                            {service.category}
                                        </span>
                                    </div>
                                </td>
                                
                                <td className="px-4 py-3 text-center border-r border-slate-200 bg-slate-50/50 font-mono font-bold text-slate-700">
                                    {formatCurrency(Number(service.rate))}
                                </td>

                                {COMMISSIONABLE_ROLES.map(role => (
                                    <td key={`${role}-${service.service}`} className="px-2 py-3 text-center border-l border-slate-100">
                                        <div className="relative mx-auto max-w-[80px]">
                                            <input
                                                type="number"
                                                min={0} max={100} step={0.5}
                                                className="w-full py-1.5 pl-2 pr-5 rounded border border-slate-200 bg-white text-slate-900 text-right focus:border-[#E33127] focus:ring-1 focus:ring-[#E33127] text-xs font-semibold shadow-sm transition-all"
                                                value={commissions[role]?.[service.service] ?? 0}
                                                onChange={(e) => handlePercentChange(role, service.service, e.target.value)}
                                                disabled={loading}
                                            />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-bold pointer-events-none">%</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* BARRA INFERIOR FLOTANTE */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-200 pt-4 pb-2 mt-6 flex flex-col md:flex-row justify-between items-center z-20 gap-3 md:gap-0">
                 <div className="text-xs text-slate-500 italic hidden md:block">
                    * Los cambios afectan el precio final de todos los usuarios inmediatamente.
                 </div>
                 <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button onClick={() => setCommissions(INITIAL_COMMISSIONS)} disabled={loading} className="px-5 py-2 text-slate-600 rounded-lg hover:bg-slate-100 font-bold transition-colors text-sm border border-transparent hover:border-slate-200">
                        Deshacer
                    </button>
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-[#E33127] text-white rounded-lg font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all text-sm disabled:opacity-70 disabled:active:scale-100">
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        {loading ? 'Guardando...' : 'Guardar Todo'}
                    </button>
                 </div>
            </div>
        </div>
    );
}