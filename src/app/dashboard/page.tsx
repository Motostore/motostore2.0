'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  ArrowRightIcon, 
  WalletIcon,
  UsersIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ServerStackIcon
} from '@heroicons/react/24/outline';

import { normalizeRole } from '@/app/lib/roles'; 

// URL de tu API
const API_BASE = "https://motostore-api.onrender.com/api/v1";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = normalizeRole(user?.role); 
  const token = user?.accessToken;
  
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  
  // ESTADOS PARA DATOS REALES
  const [providerBalances, setProviderBalances] = useState({
    danlipagos: 0,
    legiomms: 0
  });

  const [stats, setStats] = useState({
    income: 0,
    usersCount: 0,
    transactionsToday: 0,
    apiStatus: 'Conectando...'
  });
  
  const [loadingStats, setLoadingStats] = useState(false);

  // CARGA DE DATOS (Solo para Superuser/Admin)
  const fetchAllData = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
        // 1. Saldos de Proveedores (API Tiempo Real)
        const resProviders = await fetch(`${API_BASE}/admin/providers/balances`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resProviders.ok) {
            const pData = await resProviders.json();
            setProviderBalances({
                danlipagos: pData.danlipagos || 0,
                legiomms: pData.legiomms || 0
            });
        }

        // 2. Estadísticas Generales
        const resStats = await fetch(`${API_BASE}/admin/stats/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resStats.ok) {
            const sData = await resStats.json();
            setStats({
                income: sData.total_income || 0,
                usersCount: sData.total_users || 0,
                transactionsToday: sData.transactions_today || 0,
                apiStatus: 'Online 🟢'
            });
        } else {
            setStats(prev => ({ ...prev, apiStatus: 'Backend Online 🟢' }));
        }
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        setStats(prev => ({ ...prev, apiStatus: 'Offline 🔴' }));
    } finally {
        setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (['ADMIN', 'SUPERUSER'].includes(role)) {
        fetchAllData();
    }
  }, [role, token]);

  // =========================================================================
  // 👑 VISTA: SUPERUSUARIO
  // =========================================================================
  if (role === 'SUPERUSER') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 text-slate-900">
            <div>
                <span className="bg-red-50 text-[#E33127] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-100">Master Control</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">Hola, <span className="text-[#E33127]">Jefe</span> ⚡</h1>
                <p className="text-slate-500 font-medium text-sm">Estado global de proveedores y red.</p>
            </div>
            <button onClick={fetchAllData} className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:text-[#E33127]">
                <ArrowPathIcon className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} /> Sincronizar APIs
            </button>
         </header>

         {/* MI SALDO MOTOSTORE */}
         <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
             <div className="flex items-center gap-2 text-slate-400 mb-2">
                <WalletIcon className="w-5 h-5 text-[#E33127]" />
                <span className="text-xs font-bold uppercase tracking-widest">Mi Saldo Principal (MotoStore)</span>
             </div>
             <h2 className="text-5xl font-black text-slate-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}
             </h2>
         </div>

         {/* SALDOS PROVEEDORES TIEMPO REAL (VES y USD) */}
         <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Saldos APIs Proveedores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DANLIPAGOS - BOLIVARES */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Danlipagos API (Bs.)</p>
                        <h4 className="text-2xl font-black text-slate-900">
                            {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(providerBalances.danlipagos)}
                        </h4>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 font-black text-xs">VES</div>
                </div>

                {/* LEGIOMMS - DOLARES */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Legiomms API ($)</p>
                        <h4 className="text-2xl font-black text-slate-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(providerBalances.legiomms)}
                        </h4>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 font-black text-xs">USD</div>
                </div>
            </div>
         </section>

         {/* MÉTRICAS */}
         <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Ventas Globales" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.income)} icon={CurrencyDollarIcon} color="emerald" loading={loadingStats} />
            <StatCard title="Total Usuarios" value={stats.usersCount} icon={UsersIcon} color="blue" loading={loadingStats} />
            <StatCard title="API Status" value={stats.apiStatus} icon={ChartBarIcon} color="slate" loading={loadingStats} />
         </section>

         {/* GESTIÓN */}
         <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Gestión de Operaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard href="/dashboard/users?role=admin" title="Administradores" desc="Permisos de nivel 2." icon={ShieldCheckIcon} color="slate" />
                <ActionCard href="/dashboard/users?role=distributor" title="Distribuidores" desc="Red de revendedores." icon={UserGroupIcon} color="blue" />
                <ActionCard href="/dashboard/reports/general" title="Reportes" desc="Auditoría financiera." icon={ChartBarIcon} color="red" />
            </div>
         </section>
      </div>
    );
  }

  // =========================================================================
  // 🛡️ VISTA: ADMINISTRADOR
  // =========================================================================
  if (role === 'ADMIN') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8 text-slate-900">
         <header>
            <h1 className="text-3xl font-black tracking-tight">Panel <span className="text-[#E33127]">Administrativo</span></h1>
            <p className="text-slate-500 font-medium">Gestión diaria de operaciones.</p>
         </header>
         <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200 border-l-8 border-l-[#E33127]">
             <p className="text-xs font-bold uppercase text-slate-500 mb-1">Tu Saldo Operativo</p>
             <h2 className="text-4xl font-black">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard href="/dashboard/users" title="Clientes" desc="Gestionar perfiles." icon={UsersIcon} color="blue" />
            <ActionCard href="/dashboard/reports/movimiento" title="Pagos" desc="Aprobar reportes." icon={CurrencyDollarIcon} color="emerald" />
            <ActionCard href="/dashboard/products" title="Stock" desc="Inventario de productos." icon={ShoppingBagIcon} color="slate" />
         </div>
      </div>
    );
  }

  // =========================================================================
  // 👤 VISTA: CLIENTE / DISTRIBUIDOR
  // =========================================================================
  return (
    <div className="min-h-screen pb-20 animate-in fade-in space-y-8 text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hola, <span className="text-[#E33127]">{firstName}</span> 👋</h1>
          <p className="text-slate-500 font-medium mt-1">Tu centro de soluciones digitales.</p>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl"><WalletIcon className="w-6 h-6 text-[#E33127]" /></div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Saldo Disponible</p>
                <p className="text-2xl font-black tracking-tight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}</p>
            </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard href="/dashboard/products" title="Tienda" desc="Comprar servicios." icon={ShoppingBagIcon} color="blue" />
        <ActionCard href="/dashboard/reports/movimiento" title="Movimientos" desc="Ver historial." icon={CreditCardIcon} color="emerald" />
        <ActionCard href="/dashboard/settings" title="Ajustes" desc="Perfil y seguridad." icon={Cog6ToothIcon} color="slate" />
      </div>
      <div className="bg-gradient-to-r from-[#E33127] to-red-600 rounded-3xl p-8 text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-black mb-2">¿Necesitas saldo?</h3>
              <p className="text-white/90 mb-6">Reporta tu pago para recargar tu billetera.</p>
              <Link href="/dashboard/wallet/deposit" className="inline-flex items-center gap-2 bg-white text-[#E33127] px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  Reportar Pago <ArrowRightIcon className="w-4 h-4"/>
              </Link>
          </div>
          <WalletIcon className="absolute -right-6 -bottom-6 w-64 h-64 text-white/10 rotate-12" />
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ title, value, icon: Icon, color, loading }: any) {
    const colors: any = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", slate: "bg-slate-50 text-slate-600" };
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">{title}</p>
                {loading ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div> : <h4 className="text-2xl font-black">{value}</h4>}
            </div>
            <div className={`p-2 rounded-xl ${colors[color] || colors.slate}`}><Icon className="w-6 h-6" /></div>
        </div>
    );
}

function ActionCard({ href, title, desc, icon: Icon, color }: any) {
    const colors: any = { blue: "bg-blue-50 text-blue-600 hover:bg-blue-600", emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600", red: "bg-red-50 text-red-600 hover:bg-[#E33127]", slate: "bg-slate-50 text-slate-600 hover:bg-slate-800" };
    return (
        <Link href={href} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:text-white ${colors[color]}`}><Icon className="w-6 h-6" /></div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">{desc}</p>
        </Link>
    );
}
















