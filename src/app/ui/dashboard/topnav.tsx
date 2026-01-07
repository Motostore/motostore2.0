'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserGroupIcon,
  BanknotesIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ArrowDownCircleIcon,
  DocumentCheckIcon,
  WalletIcon,
  CreditCardIcon,
  IdentificationIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  PowerIcon,
  UserPlusIcon,
  MegaphoneIcon,
  LinkIcon,
  QueueListIcon,
  CodeBracketIcon // Icono para Debugger
} from '@heroicons/react/24/outline';

// Importamos desde la carpeta RBAC que recuperaste
import IfCan from '../../rbac/IfCan'; 

/* ---------- Helpers ---------- */
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type DropItem = { 
  label: string; 
  href: string; 
  isDebug?: boolean; 
  isPremium?: boolean;
  icon?: React.ReactNode; 
};

/* ---------- Componentes de UI ---------- */

const iconCls = "h-5 w-5"; 
const IconBox = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.032z" /></svg>;

function Dropdown({ label, icon, items, isActive }: { label: string; icon?: React.ReactNode; items: DropItem[]; isActive?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("click", onClickAway);
    return () => window.removeEventListener("click", onClickAway);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={cx(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 select-none tracking-wide",
          isActive 
            ? "bg-white text-[#E33127] shadow-lg shadow-red-900/20" 
            : "text-white hover:bg-white/15 hover:backdrop-blur-sm"
        )}
      >
        {icon}
        <span>{label}</span>
        <span className={`text-[10px] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="absolute left-0 mt-3 w-72 rounded-2xl bg-white shadow-2xl shadow-red-900/10 ring-1 ring-black/5 z-[999] py-3 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-left">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={cx(
              "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 border-b border-gray-50 last:border-0 group/link whitespace-nowrap",
              it.isDebug ? "text-red-600 font-bold bg-red-50 hover:bg-red-100" : "text-slate-700 hover:bg-red-50 hover:text-[#E33127]",
              it.isPremium && "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 hover:text-emerald-800",
              it.isDebug && "pl-8" 
            )}>
              {it.icon ? (
                <span className={cx("w-5 h-5", it.isPremium ? "text-emerald-600" : "text-slate-400 group-hover/link:text-[#E33127]")}>
                  {it.icon}
                </span>
              ) : (
                <span className={cx("h-1.5 w-1.5 rounded-full transition-opacity", it.isDebug ? "bg-red-600 opacity-100" : "bg-[#E33127] opacity-0 group-hover/link:opacity-100", it.isPremium && "bg-emerald-500")}></span>
              )}
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({ href, children, active, icon }: { href: string; children: React.ReactNode; active?: boolean; icon?: React.ReactNode }) {
  return (
    <Link href={href} className={cx(
      "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 tracking-wide",
      active 
        ? "bg-white text-[#E33127] shadow-lg shadow-red-900/20" 
        : "text-white hover:bg-white/15 hover:backdrop-blur-sm"
    )}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

/* ---------- Componentes Mobile ---------- */
function BottomNavItem({ href, icon, label, isActive, onClick }: { href?: string; icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void }) {
    const content = (
        <div className={cx("flex flex-col items-center justify-center gap-1 w-full h-full", isActive ? "text-[#E33127]" : "text-slate-400 hover:text-slate-600")}>
            <div className={cx("w-6 h-6 transition-transform duration-200", isActive && "scale-110")}>{icon}</div>
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
        </div>
    );

    if (onClick) {
        return <button onClick={onClick} className="w-full h-full">{content}</button>;
    }
    
    if (!href) return null;

    return <Link href={href} className="w-full h-full flex items-center justify-center">{content}</Link>;
}

function MobileNavGroup({ label, items, icon }: { label: string; items: DropItem[]; icon: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAnyActive = items.some(i => pathname === i.href);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cx("w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-700 active:bg-slate-50", isAnyActive && "text-[#E33127]")}
      >
        <span className="flex items-center gap-3">
          <span className={isAnyActive ? "text-[#E33127]" : "text-slate-400"}>{icon}</span>
          {label}
        </span>
        <ChevronDownIcon className={cx("w-5 h-5 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && (
        <div className="bg-slate-50 py-2 px-5 space-y-1">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={cx(
              "flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium",
              pathname === it.href ? "bg-white text-[#E33127] shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-[#E33127]"
            )}>
              {it.icon ? <span className="w-5 h-5">{it.icon}</span> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- MAIN COMPONENT ---------- */
export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession(); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // DETECCIÓN DE RUTAS
  const isReportPaymentPage = pathname.startsWith('/dashboard/reports/payment');
  const isWalletAdminPage = pathname.startsWith('/dashboard/wallet/admin-withdrawals'); 
  const isWalletWithdrawPage = pathname.startsWith('/dashboard/wallet/withdraw');
  const isTreasuryPage = pathname.startsWith('/dashboard/super/treasury');
  const isProductsPage = pathname.startsWith('/dashboard/products');
  const isRbacTestPage = pathname.startsWith('/dashboard/rbac-test'); // Detectar página de debug

  // Listas de Menús
  const reportesItems: DropItem[] = [
    { label: "Reporte General", href: "/dashboard/reports/general", icon: <ChartPieIcon className="w-5 h-5"/> },
    { label: "Movimientos", href: "/dashboard/reports/movimiento", icon: <PresentationChartLineIcon className="w-5 h-5"/> },
    { label: "Utilidades Neta", href: "/dashboard/reports/utilidades", icon: <CurrencyDollarIcon className="w-5 h-5"/> },
  ];
  const isReportActive = pathname.startsWith("/dashboard/reports") && !isReportPaymentPage;

  const comprasItems: DropItem[] = [
    { label: "Admin Retiros", href: "/dashboard/wallet/admin-withdrawals", icon: <ArrowDownCircleIcon className="w-5 h-5"/>, isPremium: true },
    { label: "Aprobar Pagos", href: "/dashboard/payments/approvals", icon: <CheckBadgeIcon className="w-5 h-5"/>, isPremium: true },
    { label: "Reportar Pago", href: "/dashboard/reports/payment", icon: <DocumentCheckIcon className="w-5 h-5"/> },
    { label: "Mi Billetera / Retirar", href: "/dashboard/wallet/withdraw", icon: <WalletIcon className="w-5 h-5"/> },
    { label: "Mis Compras", href: "/dashboard/purchases/mine", icon: <ShoppingBagIcon className="w-5 h-5"/> },
    { label: "Métodos de Pago", href: "/dashboard/payment-methods", icon: <CreditCardIcon className="w-5 h-5"/> }, 
  ];
  const isComprasActive = pathname.startsWith("/dashboard/purchases") || pathname.startsWith("/dashboard/payments") || pathname.startsWith("/dashboard/payment-methods") || isReportPaymentPage || isWalletAdminPage || isWalletWithdrawPage; 

  const usuariosItems: DropItem[] = [
    { label: "Crear Usuario Nuevo", href: "/dashboard/users/create", icon: <UserPlusIcon className="w-5 h-5"/> },
    { label: "Lista de Usuarios", href: "/dashboard/users/list", icon: <UserGroupIcon className="w-5 h-5"/> },
    { label: "Transacciones", href: "/dashboard/users/transactions", icon: <ArrowsRightLeftIcon className="w-5 h-5"/> }, 
    { label: "Barra de Anuncios", href: "/dashboard/users/announcement-bar", icon: <MegaphoneIcon className="w-5 h-5"/> },
    { label: "Link de Registro", href: "/dashboard/users/register-url", icon: <LinkIcon className="w-5 h-5"/> },
  ];
  
  // CONFIGURACIÓN (Con Debugger RESTAURADO)
  const configItems = useMemo(() => {
    const items: DropItem[] = [
        { label: "Mi Perfil", href: "/dashboard/profile", icon: <UserIcon className="w-5 h-5"/> },
        { label: "Datos de cuenta", href: "/dashboard/settings/account", icon: <IdentificationIcon className="w-5 h-5"/> },
        { label: "Seguridad / Clave", href: "/dashboard/settings/password", icon: <LockClosedIcon className="w-5 h-5"/> },
        { label: "Teléfono / WhatsApp", href: "/dashboard/settings/phone", icon: <DevicePhoneMobileIcon className="w-5 h-5"/> },
        { label: "Correo Electrónico", href: "/dashboard/settings/email", icon: <EnvelopeIcon className="w-5 h-5"/> },
    ];
    const role = (session?.user as any)?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SUPERUSER') {
        items.push({ label: "Tesorería Global", href: "/dashboard/super/treasury", icon: <ArrowsRightLeftIcon className="w-5 h-5"/> });
        items.push({ label: "Comisiones", href: "/dashboard/settings/commissions", icon: <CurrencyDollarIcon className="w-5 h-5"/> });
        
        // --- AQUÍ ESTÁ EL DEBUGGER (Oculto en Configuración para Admins) ---
        items.push({ 
            label: "🛠️ RBAC Debugger", 
            href: "/dashboard/rbac-test", 
            icon: <CodeBracketIcon className="w-5 h-5"/>,
            isDebug: true // Se verá rojo en el menú para diferenciarlo
        });
    }
    return items;
  }, [session]);

  return (
    <>
    {/* 1. BARRA DE ESCRITORIO (Visible solo en PC - lg:block) */}
    <div className="hidden lg:block w-full bg-gradient-to-r from-[#E33127] via-[#D9251C] to-[#B91C1C] text-white shadow-lg shadow-red-900/20 z-20 relative">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center justify-between h-[70px]">
          <nav className="flex items-center gap-1.5">
            <NavLink href="/" active={pathname === "/"} icon={<HomeIcon className="w-5 h-5"/>}>INICIO</NavLink>
            <NavLink href="/dashboard/products" active={isProductsPage} icon={<IconBox />}>PRODUCTOS</NavLink>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            
            <Dropdown label="REPORTES" icon={<DocumentChartBarIcon className="w-5 h-5"/>} items={reportesItems} isActive={isReportActive} />
            <Dropdown label="COMPRAS" icon={<BanknotesIcon className="w-5 h-5"/>} items={comprasItems} isActive={isComprasActive} />
            <Dropdown label="CONFIGURACIÓN" icon={<Cog6ToothIcon className="w-5 h-5"/>} items={configItems} isActive={pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/profile") || isTreasuryPage || isRbacTestPage} />
            
            <IfCan permission="manage_users">
                <Dropdown label="USUARIOS" icon={<UserGroupIcon className="w-5 h-5"/>} items={usuariosItems} isActive={pathname.startsWith("/dashboard/users")} />
            </IfCan>
            
          </nav>

          <div className="flex items-center gap-3 pl-6 border-l border-white/10 ml-4">
              <Link href="/dashboard/help" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-100 hover:bg-white/10 hover:text-white transition-all">
                <InformationCircleIcon className="w-5 h-5" /> AYUDA
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black bg-white text-[#E33127] shadow-lg hover:bg-red-50 hover:shadow-xl transition-all">
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> SALIR
              </button>
          </div>
        </div>
      </div>
    </div>

    {/* 2. BARRA DE NAVEGACIÓN INFERIOR (Mobile) */}
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[40] flex items-center justify-around h-[60px] pb-1">
        <BottomNavItem href="/" icon={<HomeIcon />} label="Inicio" isActive={pathname === '/'} />
        <BottomNavItem onClick={() => setMobileMenuOpen(true)} icon={<QueueListIcon />} label="Menú" isActive={mobileMenuOpen} />
        <BottomNavItem href="/dashboard/products" icon={<ShoppingBagIcon />} label="Productos" isActive={pathname.startsWith('/dashboard/products')} />
        <BottomNavItem href="/dashboard/purchases/mine" icon={<WalletIcon />} label="Compras" isActive={isComprasActive} />
    </div>

    {/* 3. MENU DRAWER (Móvil) */}
    {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col pb-20"> 
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#E33127] to-[#B91C1C] text-white">
              <span className="font-black text-xl tracking-tight">MOTO STORE</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 text-slate-800">
              <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4 font-bold hover:bg-slate-50 border-b border-slate-100 text-slate-700">
                  <HomeIcon className="w-5 h-5 text-slate-400"/> Inicio
              </Link>
              <Link href="/dashboard/products" className="flex items-center gap-3 px-5 py-4 font-bold hover:bg-slate-50 border-b border-slate-100 text-slate-700">
                  <IconBox /> Productos
              </Link>

              <MobileNavGroup label="REPORTES" icon={<ChartPieIcon className="w-5 h-5"/>} items={reportesItems} />
              <MobileNavGroup label="COMPRAS" icon={<BanknotesIcon className="w-5 h-5"/>} items={comprasItems} />
              <MobileNavGroup label="CONFIGURACIÓN" icon={<Cog6ToothIcon className="w-5 h-5"/>} items={configItems} />
              
              <IfCan permission="manage_users">
                  <MobileNavGroup label="USUARIOS" icon={<UserGroupIcon className="w-5 h-5"/>} items={usuariosItems} />
              </IfCan>

              <Link href="/dashboard/help" className="flex items-center gap-3 px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                <span className="text-[#E33127]"><InformationCircleIcon className="w-5 h-5"/></span> AYUDA
              </Link>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 mb-14">
               <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-[#E33127] font-bold">
                   <ArrowRightOnRectangleIcon className="w-5 h-5"/> CERRAR SESIÓN
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



























