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
  ServerStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon
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
  
  // ESTADO: Datos reales (Empiezan en 0 o cargando)
  const [stats, setStats] = useState({
    income: 0,
    usersCount: 0,
    transactionsToday: 0,
    apiStatus: 'Conectando...'
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // EFECTO: Cargar datos reales al entrar (Solo para Admins/Super)
  useEffect(() => {
    if (['ADMIN', 'SUPERUSER'].includes(role) && token) {
        fetchRealStats();
    }
  }, [role, token]);

  async function fetchRealStats() {
      setLoadingStats(true);
      try {
          // Intentamos obtener resumen. 
          // NOTA: Si este endpoint no existe en tu backend, dará error y mostraremos 0.
          const res = await fetch(`${API_BASE}/admin/stats/summary`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              setStats({
                  income: data.total_income || 0,
                  usersCount: data.total_users || 0,
                  transactionsToday: data.transactions_today || 0,
                  apiStatus: 'Online 🟢'
              });
          } else {
              // Si falla, al menos el status es online pero sin datos
              setStats(prev => ({ ...prev, apiStatus: 'Backend Online 🟢' }));
          }
      } catch (error) {
          console.error("Error cargando stats", error);
          setStats(prev => ({ ...prev, apiStatus: 'Offline 🔴' }));
      } finally {
          setLoadingStats(false);
      }
  }

  // =========================================================================
  // 👑 NIVEL 1: SUPERUSUARIO (GOD MODE)
  // =========================================================================
  if (role === 'SUPERUSER') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         {/* HEADER SUPERIOR */}
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
                <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Master Control</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Hola, <span className="text-[#E33127]">Jefe</span> ⚡
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  {loadingStats ? "Sincronizando datos..." : "Sistema actualizado."}
                </p>
            </div>
            
            <button 
                onClick={fetchRealStats}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowPathIcon className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
                Actualizar Datos
            </button>
         </header>

         {/* 1. TARJETA GIGANTE DE SALDO PROVEEDOR (Lo que pediste) */}
         <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-400/20 relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                     <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <WalletIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Saldo Proveedor (Tu Capital)</span>
                     </div>
                     <h2 className="text-5xl font-black tracking-tighter">
                        {/* Muestra el saldo real de la sesión del usuario */}
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}
                     </h2>
                     <p className="text-sm text-slate-400 mt-2 font-medium">
                        Capital disponible para ventas y operaciones.
                     </p>
                 </div>
                 
                 {/* Botón rápido de Taquilla si quisieras usarla, o recarga externa */}
                 <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <p className="text-xs text-slate-300 font-bold mb-1">Estado API</p>
                     <p className="text-emerald-400 font-mono font-bold">{stats.apiStatus}</p>
                 </div>
             </div>
             
             {/* Decoración de fondo */}
             <GlobeAmericasIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
         </div>

         {/* 2. ESTADÍSTICAS (Datos Reales o 0 si no hay ventas) */}
         <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Métricas del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Ventas Totales (Est.)" 
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.income)} 
                    icon={CurrencyDollarIcon} 
                    color="emerald" 
                    loading={loadingStats}
                />
                <StatCard 
                    title="Usuarios Totales" 
                    value={stats.usersCount} 
                    icon={UsersIcon} 
                    color="blue" 
                    loading={loadingStats}
                />
                <StatCard 
                    title="Transacciones Hoy" 
                    value={stats.transactionsToday} 
                    icon={ChartBarIcon} 
                    color="purple" 
                    loading={loadingStats}
                />
            </div>
         </section>

         {/* 3. GESTIÓN DE RED */}
         <section className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <GlobeAmericasIcon className="w-5 h-5 text-[#E33127]" />
                Gestión de Red
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard 
                    href="/dashboard/users?role=admin"
                    title="Administradores"
                    desc="Gestionar permisos."
                    icon={ShieldCheckIcon}
                    color="slate"
                />
                <ActionCard 
                    href="/dashboard/users?role=distributor"
                    title="Distribuidores"
                    desc="Controlar red."
                    icon={UserGroupIcon}
                    color="blue"
                />
                <ActionCard 
                    href="/dashboard/reports/general"
                    title="Auditoría"
                    desc="Ver movimientos."
                    icon={ChartBarIcon}
                    color="red"
                />
            </div>
         </section>
      </div>
    );
  }

  // =========================================================================
  // 🛡️ NIVEL 2: ADMINISTRADOR
  // =========================================================================
  if (role === 'ADMIN') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         <header>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Panel <span className="text-blue-600">Administrativo</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Gestión operativa.</p>
         </header>

         {/* SALDO ADMIN (Operativo) */}
         <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20">
             <p className="text-xs font-bold uppercase text-blue-200">Tu Saldo Operativo</p>
             <h2 className="text-4xl font-black mt-1">
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}
             </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              href="/dashboard/users"
              title="Gestión de Clientes"
              desc="Crear y editar usuarios."
              icon={UsersIcon}
              color="blue"
            />
            <ActionCard 
              href="/dashboard/reports/movimiento"
              title="Aprobar Pagos"
              desc="Zelle y Pago Móvil."
              icon={CurrencyDollarIcon}
              color="emerald"
            />
            <ActionCard 
              href="/dashboard/products"
              title="Inventario"
              desc="Ver stock disponible."
              icon={ShoppingBagIcon}
              color="slate"
            />
         </div>
      </div>
    );
  }

  // =========================================================================
  // 👤 NIVEL 3: CLIENTE (Igual que antes, funciona bien)
  // =========================================================================
  return (
    <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hola, <span className="text-[#E33127]">{firstName}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">Bienvenido a tu panel.</p>
        </div>
        
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
                <WalletIcon className="w-6 h-6 text-[#E33127]" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Saldo Disponible</p>
                <p className="text-2xl font-black tracking-tight">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.balance || 0)}
                </p>
            </div>
        </div>
      </header>

      <hr className="border-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard href="/dashboard/products" title="Tienda / Productos" desc="Compra servicios." icon={ShoppingBagIcon} color="blue" />
        <ActionCard href="/dashboard/reports/movimiento" title="Mis Movimientos" desc="Historial." icon={CreditCardIcon} color="emerald" />
        <ActionCard href="/dashboard/settings" title="Mi Cuenta" desc="Seguridad." icon={Cog6ToothIcon} color="slate" />
      </div>

      <div className="bg-gradient-to-r from-[#E33127] to-red-600 rounded-3xl p-8 text-white shadow-lg shadow-red-500/20 relative overflow-hidden group">
          <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-black mb-2">¿Necesitas saldo?</h3>
              <p className="font-medium text-white/90 mb-6">Reporta tu pago para recargar.</p>
              <Link href="/dashboard/wallet/deposit" className="inline-flex items-center gap-2 bg-white text-[#E33127] px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-lg">
                  Reportar Pago <ArrowRightIcon className="w-4 h-4"/>
              </Link>
          </div>
          <WalletIcon className="absolute -right-6 -bottom-6 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
      </div>
    </div>
  );
}

// === COMPONENTES VISUALES ===

function StatCard({ title, value, icon: Icon, color, loading }: any) {
    const colors: any = {
        emerald: "text-emerald-600 bg-emerald-50",
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        slate: "text-slate-600 bg-slate-50",
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
                ) : (
                    <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                )}
            </div>
            <div className={`p-2 rounded-xl ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}

function ActionCard({ href, title, desc, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        red: "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white",
    };

    return (
        <Link href={href} className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${colors[color] || colors.slate}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
            
            <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRightIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-200" />
            </div>
        </Link>
    );
}

















