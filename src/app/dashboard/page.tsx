'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  // Iconos Generales
  ShoppingBagIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  ArrowRightIcon, 
  WalletIcon,
  // Iconos Admin/Super
  UsersIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  GlobeAmericasIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

import { normalizeRole } from '@/app/lib/roles'; 

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = normalizeRole(user?.role); 
  
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const balance = user?.balance || 0;

  // =========================================================================
  // 👑 NIVEL 1: SUPERUSUARIO (GOD MODE)
  // Ve todo: Finanzas globales, Servidores, y Control de Subordinados
  // =========================================================================
  if (role === 'SUPERUSER') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         {/* HEADER SUPERIOR */}
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
                <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Master Control</span>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Hola, <span className="text-[#E33127]">Jefe</span> ⚡
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  Sistema MotoStore operando al 100%.
                </p>
            </div>
            
            <div className="flex gap-3">
                 <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 font-bold uppercase">Hora del Servidor</p>
                    <p className="font-mono text-slate-700">{new Date().toLocaleTimeString()}</p>
                 </div>
            </div>
         </header>

         {/* 1. SECCIÓN: ESTADÍSTICAS GLOBALES */}
         <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Finanzas & Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Ingresos Brutos" value="$12,450.00" icon={CurrencyDollarIcon} color="emerald" trend="+12%" />
                <StatCard title="Usuarios Activos" value="1,240" icon={UsersIcon} color="blue" trend="+5%" />
                <StatCard title="Transacciones Hoy" value="85" icon={ChartBarIcon} color="purple" trend="+2" />
                <StatCard title="Estado API" value="En Línea" icon={ServerStackIcon} color="slate" trend="14ms" />
            </div>
         </section>

         {/* 2. SECCIÓN: GESTIÓN DE SUBORDINADOS Y RED */}
         <section className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <GlobeAmericasIcon className="w-5 h-5 text-[#E33127]" />
                    Gestión de Red & Subordinados
                </h3>
                <Link href="/dashboard/users" className="text-xs font-bold text-[#E33127] hover:underline">
                    Ver directorio completo →
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard 
                    href="/dashboard/users?role=admin"
                    title="Administradores"
                    desc="Gestionar permisos de tus encargados directos."
                    icon={ShieldCheckIcon}
                    color="slate"
                />
                <ActionCard 
                    href="/dashboard/users?role=distributor"
                    title="Distribuidores"
                    desc="Controlar red de revendedores y comisiones."
                    icon={UserGroupIcon}
                    color="blue"
                />
                <ActionCard 
                    href="/dashboard/reports/general"
                    title="Auditoría Global"
                    desc="Revisar movimientos de toda la jerarquía."
                    icon={ChartBarIcon}
                    color="red"
                />
            </div>
         </section>

         {/* 3. ACCESOS RÁPIDOS DE CONFIGURACIÓN */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/users/announcement-bar" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <GlobeAmericasIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Anuncios Globales</h4>
                    <p className="text-xs text-slate-500">Cambiar marquesina (Interna/Externa).</p>
                </div>
            </Link>

            <Link href="/dashboard/settings" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                    <Cog6ToothIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Configuración del Sistema</h4>
                    <p className="text-xs text-slate-500">Variables de entorno y seguridad.</p>
                </div>
            </Link>
         </div>
      </div>
    );
  }

  // =========================================================================
  // 🛡️ NIVEL 2: ADMINISTRADOR (OPERATIVO)
  // Ve gestión de día a día: Usuarios, Reportes, pero sin tocar el código base.
  // =========================================================================
  if (role === 'ADMIN') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Panel <span className="text-blue-600">Administrativo</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Gestión operativa de usuarios y ventas.
                </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-blue-700 font-bold text-sm">
                <ShieldCheckIcon className="w-5 h-5"/>
                Admin Mode
            </div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              href="/dashboard/users"
              title="Gestión de Clientes"
              desc="Crear usuarios, editar saldos y ver perfiles."
              icon={UsersIcon}
              color="blue"
            />
            <ActionCard 
              href="/dashboard/reports/movimiento"
              title="Aprobar Pagos"
              desc="Revisar reportes de Zelle/Pago Móvil."
              icon={CurrencyDollarIcon}
              color="emerald"
            />
            <ActionCard 
              href="/dashboard/reports/general"
              title="Reporte de Ventas"
              desc="Ver flujo de caja diario."
              icon={ChartBarIcon}
              color="slate"
            />
         </div>
      </div>
    );
  }

  // =========================================================================
  // 👤 NIVEL 3: CLIENTE / DISTRIBUIDOR
  // Enfocado en consumir: Ver su saldo, comprar y recargar.
  // =========================================================================
  return (
    <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
      
      {/* HEADER CLIENTE */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hola, <span className="text-[#E33127]">{firstName}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Bienvenido a tu panel personal.
          </p>
        </div>
        
        {/* TARJETA DE SALDO (Muy visual) */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-white/10 rounded-xl">
                <WalletIcon className="w-6 h-6 text-[#E33127]" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Saldo Disponible</p>
                <p className="text-2xl font-black tracking-tight">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
                </p>
            </div>
        </div>
      </header>

      <hr className="border-slate-200" />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          href="/dashboard/products"
          title="Tienda / Productos"
          desc="Adquiere licencias de streaming y servicios."
          icon={ShoppingBagIcon}
          color="blue"
        />
        <ActionCard 
          href="/dashboard/reports/movimiento"
          title="Mis Movimientos"
          desc="Historial de compras, recargas y gastos."
          icon={CreditCardIcon}
          color="emerald"
        />
        <ActionCard 
          href="/dashboard/settings"
          title="Mi Cuenta"
          desc="Seguridad, contraseña y perfil."
          icon={Cog6ToothIcon}
          color="slate"
        />
      </div>

      {/* BANNER RECARGA (Call to Action) */}
      <div className="bg-gradient-to-r from-[#E33127] to-red-600 rounded-3xl p-8 text-white shadow-lg shadow-red-500/20 relative overflow-hidden group">
          <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-black mb-2">¿Necesitas saldo?</h3>
              <p className="font-medium text-white/90 mb-6">
                  Reporta tu pago vía Zelle, Pago Móvil o Binance para recargar tu billetera al instante.
              </p>
              <Link href="/dashboard/wallet/deposit" className="inline-flex items-center gap-2 bg-white text-[#E33127] px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-lg">
                  Reportar Pago <ArrowRightIcon className="w-4 h-4"/>
              </Link>
          </div>
          <WalletIcon className="absolute -right-6 -bottom-6 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
      </div>
    </div>
  );
}

// === COMPONENTES VISUALES REUTILIZABLES ===

function StatCard({ title, value, icon: Icon, color, trend }: any) {
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
                <h4 className="text-2xl font-black text-slate-900">{value}</h4>
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

















