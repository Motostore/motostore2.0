'use client';

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
  // TicketIcon Eliminado por seguridad
} from '@heroicons/react/24/outline';

import { normalizeRole } from '@/app/lib/roles'; 

export default function InicioPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = normalizeRole(user?.role); 
  
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const balance = user?.balance || 0;

  // =========================================================================
  // 👑 VISTA 1: ADMINISTRADORES Y SUPERUSUARIOS
  // =========================================================================
  if (['ADMIN', 'SUPERUSER'].includes(role)) {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in space-y-8">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Panel <span className="text-[#E33127]">Administrativo</span> 🛠️
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Resumen global y control operativo de Moto Store LLC.
                </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <WalletIcon className="w-5 h-5 text-slate-400"/>
                <span className="font-bold text-slate-600 text-sm">
                   Tu Wallet: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
                </span>
            </div>
         </header>

         <hr className="border-slate-200" />

         {/* Grid ajustado a 3 columnas porque quitamos la Taquilla */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard 
              href="/dashboard/reports/general"
              title="Finanzas Globales"
              desc="Ganancias, ventas y flujo de caja."
              icon={CurrencyDollarIcon}
              color="emerald"
            />
            <DashboardCard 
              href="/dashboard/users"
              title="Gestión Usuarios"
              desc="Administrar clientes y red."
              icon={UsersIcon}
              color="blue"
            />
            {/* TAQUILLA ELIMINADA AQUI */}
            <DashboardCard 
              href="/dashboard/settings"
              title="Configuración"
              desc="Ajustes del sistema y seguridad."
              icon={Cog6ToothIcon}
              color="slate"
            />
         </div>

         {/* ACCESOS RÁPIDOS EXTRA */}
         <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-full">
                    <ChartBarIcon className="w-6 h-6 text-[#E33127]" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Reportes de Movimiento</h3>
                    <p className="text-slate-400 text-xs">Auditoría completa de transacciones.</p>
                </div>
             </div>
             <Link href="/dashboard/reports/movimiento" className="px-6 py-3 bg-[#E33127] hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors">
                 Ver Auditoría
             </Link>
         </div>
      </div>
    );
  }

  // =========================================================================
  // 👤 VISTA 2: CLIENTES Y DISTRIBUIDORES
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
        
        {/* TARJETA DE SALDO PREMIUM */}
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

      {/* GRID CLIENTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          href="/dashboard/products"
          title="Tienda / Productos"
          desc="Compra licencias y servicios activos."
          icon={ShoppingBagIcon}
          color="blue"
        />
        <DashboardCard 
          href="/dashboard/reports/movimiento"
          title="Mis Movimientos"
          desc="Historial de compras y recargas."
          icon={CreditCardIcon}
          color="emerald"
        />
        <DashboardCard 
          href="/dashboard/settings"
          title="Mi Cuenta"
          desc="Datos personales y contraseñas."
          icon={Cog6ToothIcon}
          color="slate"
        />
      </div>

      {/* BANNER CTA DE RECARGA */}
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

// === COMPONENTE VISUAL DE TARJETA ===
function DashboardCard({ href, title, desc, icon: Icon, color }: any) {
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