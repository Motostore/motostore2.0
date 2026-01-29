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
  UserPlusIcon,
  MegaphoneIcon,
  LinkIcon,
  QueueListIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

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

/* ---------- Componentes de UI (Iconos) ---------- */
const iconCls = "h-5 w-5"; 
const IconBox = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.032z" /></svg>;

/* ---------- DROPDOWN MODERNO ---------- */
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
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none",
          isActive 
            ? "bg-[#E33127] text-white shadow-md shadow-red-100" 
            : "text-slate-600 hover:bg-red-50 hover:text-[#E33127]"
        )}
      >
        {icon}
        <span>{label}</span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-black/5 z-[999] py-2 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={cx(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 mx-2 rounded-lg",
              it.isDebug ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-slate-600 hover:bg-slate-50 hover:text-[#E33127]",
              it.isPremium && "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50",
            )}>
              {it.icon ? (
                <span className={cx("w-5 h-5", it.isPremium ? "text-emerald-600" : "text-slate-400")}>
                  {it.icon}
                </span>
              ) : (
                <span className={cx("h-1.5 w-1.5 rounded-full", it.isDebug ? "bg-red-600" : "bg-[#E33127]")}></span>
              )}
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- NAVLINK MODERNO ---------- */
function NavLink({ href, children, active, icon }: { href: string; children: React.ReactNode; active?: boolean; icon?: React.ReactNode }) {
  return (
    <Link href={href} className={cx(
      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
      active 
        ? "bg-[#E33127] text-white shadow-md shadow-red-100" 
        : "text-slate-600 hover:bg-red-50 hover:text-[#E33127]"
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
    if (onClick) return <button onClick={onClick} className="w-full h-full">{content}</button>;
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

  const user = session?.user as { role?: string } | undefined;
  const role = user?.role?.toUpperCase() || '';
  
  const isAdminOrSuper = role === 'ADMIN' || role === 'SUPERUSER';

  const isReportPaymentPage = pathname.startsWith('/dashboard/reports/payment');
  const isWalletAdminPage = pathname.startsWith('/dashboard/wallet/admin-withdrawals'); 
  const isWalletWithdrawPage = pathname.startsWith('/dashboard/wallet/withdraw');
  const isTreasuryPage = pathname.startsWith('/dashboard/super/treasury');
  const isProductsPage = pathname.startsWith('/dashboard/products');

  // ✅ 1. Reportes ahora incluye "Reportar Pago"
  const reportesItems: DropItem[] = [
    { label: "Reporte General", href: "/dashboard/reports/general", icon: <ChartPieIcon className="w-5 h-5"/> },
    { label: "Movimientos", href: "/dashboard/reports/movimiento", icon: <PresentationChartLineIcon className="w-5 h-5"/> },
    { label: "Utilidades Neta", href: "/dashboard/reports/utilidades", icon: <CurrencyDollarIcon className="w-5 h-5"/> },
    { label: "Reportar Pago", href: "/dashboard/payments/report", icon: <DocumentCheckIcon className="w-5 h-5"/> },
  ];
  const isReportActive = pathname.startsWith("/dashboard/reports") || pathname.startsWith("/dashboard/payments/report");

  // ✅ 2. Compras
  const comprasItems: DropItem[] = [
    { label: "Admin Retiros", href: "/dashboard/wallet/admin-withdrawals", icon: <ArrowDownCircleIcon className="w-5 h-5"/>, isPremium: true },
    { label: "Aprobar Pagos", href: "/dashboard/payments/approvals", icon: <CheckBadgeIcon className="w-5 h-5"/>, isPremium: true },
    { label: "Mi Billetera / Retirar", href: "/dashboard/wallet/withdraw", icon: <WalletIcon className="w-5 h-5"/> },
    { label: "Mis Compras", href: "/dashboard/purchases/mine", icon: <ShoppingBagIcon className="w-5 h-5"/> },
    { label: "Métodos de Pago", href: "/dashboard/payment-methods", icon: <CreditCardIcon className="w-5 h-5"/> }, 
  ];
  const isComprasActive = pathname.startsWith("/dashboard/purchases") || pathname.startsWith("/dashboard/payments") && !pathname.startsWith("/dashboard/payments/report") || pathname.startsWith("/dashboard/payment-methods") || isWalletAdminPage || isWalletWithdrawPage; 

  const usuariosItems: DropItem[] = [
    { label: "Crear Usuario Nuevo", href: "/dashboard/users/create", icon: <UserPlusIcon className="w-5 h-5"/> },
    { label: "Lista de Usuarios", href: "/dashboard/users/list", icon: <UserGroupIcon className="w-5 h-5"/> },
    { label: "Transacciones", href: "/dashboard/users/transactions", icon: <ArrowsRightLeftIcon className="w-5 h-5"/> }, 
    { label: "Barra de Anuncios", href: "/dashboard/users/announcement-bar", icon: <MegaphoneIcon className="w-5 h-5"/> },
    { label: "Link de Registro", href: "/dashboard/users/register-url", icon: <LinkIcon className="w-5 h-5"/> },
  ];
  
  // ✅ 3. CONFIGURACIÓN (CORREGIDO)
  const configItems = useMemo(() => {
    const items: DropItem[] = [
        { label: "Mi Perfil", href: "/dashboard/profile", icon: <UserIcon className="w-5 h-5"/> },
        
        // CORREGIDO: Usamos ?tab=profile porque ya no existe la carpeta settings/personal-info
        { label: "Datos Personales", href: "/dashboard/settings?tab=profile", icon: <IdentificationIcon className="w-5 h-5"/> },

        // ESTE SE MANTIENE porque el archivo src/app/dashboard/settings/account/page.tsx DEBE EXISTIR
        { label: "Datos de cuenta", href: "/dashboard/settings/account", icon: <BanknotesIcon className="w-5 h-5"/> },
        
        // CORREGIDO: Usamos ?tab=security
        { label: "Seguridad / Clave", href: "/dashboard/settings?tab=security", icon: <LockClosedIcon className="w-5 h-5"/> },
        
        // CORREGIDO: Usamos ?tab=phone
        { label: "Teléfono / WhatsApp", href: "/dashboard/settings?tab=phone", icon: <DevicePhoneMobileIcon className="w-5 h-5"/> },
        
        // CORREGIDO: Usamos ?tab=email
        { label: "Correo Electrónico", href: "/dashboard/settings?tab=email", icon: <EnvelopeIcon className="w-5 h-5"/> },
    ];
    
    if (isAdminOrSuper) {
        items.push({ label: "Tesorería Global", href: "/dashboard/super/treasury", icon: <ArrowsRightLeftIcon className="w-5 h-5"/> });
        items.push({ label: "Comisiones", href: "/dashboard/settings/commissions", icon: <CurrencyDollarIcon className="w-5 h-5"/> });
    }
    return items;
  }, [isAdminOrSuper]);

  return (
    <>
    {/* 1. BARRA DE ESCRITORIO */}
    <div className="hidden lg:block w-full bg-white border-b border-gray-100 z-20 relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <nav className="flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"} icon={<HomeIcon className="w-5 h-5"/>}>INICIO</NavLink>
            <NavLink href="/dashboard/products" active={isProductsPage} icon={<IconBox />}>PRODUCTOS</NavLink>
            
            <div className="h-6 w-px bg-gray-200 mx-3"></div>
            
            <Dropdown label="REPORTES" icon={<DocumentChartBarIcon className="w-5 h-5"/>} items={reportesItems} isActive={isReportActive} />
            <Dropdown label="COMPRAS" icon={<BanknotesIcon className="w-5 h-5"/>} items={comprasItems} isActive={isComprasActive} />
            <Dropdown label="CONFIGURACIÓN" icon={<Cog6ToothIcon className="w-5 h-5"/>} items={configItems} isActive={pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/profile") || isTreasuryPage} />
            
            {isAdminOrSuper && (
                <Dropdown label="USUARIOS" icon={<UserGroupIcon className="w-5 h-5"/>} items={usuariosItems} isActive={pathname.startsWith("/dashboard/users")} />
            )}
          </nav>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-100 ml-4">
              <Link href="/dashboard/help" className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
                <InformationCircleIcon className="w-5 h-5" />
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 hover:border-red-100">
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> SALIR
              </button>
          </div>
        </div>
      </div>
    </div>

    {/* 2. BARRA INFERIOR MOBILE */}
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[40] flex items-center justify-around h-[60px] pb-1">
        <BottomNavItem href="/" icon={<HomeIcon />} label="Inicio" isActive={pathname === '/'} />
        <BottomNavItem onClick={() => setMobileMenuOpen(true)} icon={<QueueListIcon />} label="Menú" isActive={mobileMenuOpen} />
        <BottomNavItem href="/dashboard/products" icon={<ShoppingBagIcon />} label="Productos" isActive={pathname.startsWith('/dashboard/products')} />
        <BottomNavItem href="/dashboard/purchases/mine" icon={<WalletIcon />} label="Compras" isActive={isComprasActive} />
    </div>

    {/* 3. DRAWER MOBILE */}
    {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col pb-20"> 
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#E33127] to-[#B91C1C] text-white">
              <span className="font-black text-xl tracking-tight">MOTO STORE LLC</span>
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
              
              {isAdminOrSuper && (
                  <MobileNavGroup label="USUARIOS" icon={<UserGroupIcon className="w-5 h-5"/>} items={usuariosItems} />
              )}

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

























