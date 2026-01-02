// src/components/dashboard/topnav.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { 
  // Configuración
  UserIcon, IdentificationIcon, LockClosedIcon, DevicePhoneMobileIcon,
  EnvelopeIcon, ArrowsRightLeftIcon, 
  // Usuarios
  UserPlusIcon, UsersIcon, MegaphoneIcon, LinkIcon,
  ArrowsRightLeftIcon as TransactionsIcon, 
  // Reportes
  ChartPieIcon, PresentationChartLineIcon, CurrencyDollarIcon, 
  // Compras & Pagos
  DocumentCheckIcon, ShoppingBagIcon, CreditCardIcon, CheckBadgeIcon,
  // Nuevos iconos
  ArrowDownCircleIcon, WalletIcon,
  // UI
  Bars3Icon, XMarkIcon, ChevronDownIcon, 
  HomeIcon, 
  QueueListIcon // Icono correcto para "Menú"
} from '@heroicons/react/24/outline';

import IfCan from "../../rbac/IfCan"; 

/* ---------- Helpers ---------- */
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type DropItem = { 
  label: string; 
  href: string; 
  isDebug?: boolean; 
  isPremium?: boolean;
  icon?: React.ReactNode; 
};

/* ---------- ICONOS SVG (Manuales para Desktop) ---------- */
const iconCls = "h-5 w-5"; 
const IconHome = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M11.03 2.59a1.5 1.5 0 011.94 0l7.5 6.363a1.5 1.5 0 01.53 1.144V19.5a1.5 1.5 0 01-1.5 1.5h-5.75a.75.75 0 01-.75-.75V14h-2v6.25a.75.75 0 01-.75.75H4.5A1.5 1.5 0 013 19.5v-9.403c0-.44.17-.86.47-1.144l7.56-6.364z" /></svg>;
const IconBox = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.032z" /></svg>;
const IconChart = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c-1.035 0-1.875.84-1.875 1.875v9.375c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V10.5c0-1.035-.84-1.875-1.875-1.875h-.75zM3 13.125c-1.035 0-1.875.84-1.875 1.875v4.875c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875v-4.875c0-1.035-.84-1.875-1.875-1.875h-.75z" /></svg>;
const IconMoney = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" /><path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" /></svg>;
const IconConfig = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" /></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.67v-1.029a9.37 9.37 0 00-6.001-8.498c.01.175.016.351.016.529 0 3.99-2.43 7.372-5.963 8.735a12.97 12.97 0 013.7 1.788l-.001.052z" /></svg>;
const IconInfo = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>;
const IconPower = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.809 3.808-9.98 3.808-13.788 0-3.808-3.809-3.808-9.98 0-13.788a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>;
const IconCode = () => <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor"><path d="M10.25 6.75a.75.75 0 00-1.06 0l-3.25 3.25a.75.75 0 000 1.06l3.25 3.25a.75.75 0 001.06-1.06L7.31 10.5l2.94-2.94a.75.75 0 000-1.06zM13.75 6.75a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06l2.94-2.94-2.94-2.94a.75.75 0 010-1.06zM4.5 3.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" /></svg>;

/* ---------- Desktop Dropdown ---------- */
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

// NUEVO: Ítem de la barra inferior tipo App
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
    
    // Si no hay href, no renderiza nada (protección)
    if (!href) return null;

    return <Link href={href} className="w-full h-full flex items-center justify-center">{content}</Link>;
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

  const debugItem: DropItem = { label: "⚙️ RBAC Debugger", href: "/dashboard/rbac-test", isDebug: true, icon: <IconCode /> };
  
  const usuariosItems: DropItem[] = [
    { label: "Crear Usuario Nuevo", href: "/dashboard/users/create", icon: <UserPlusIcon className="w-5 h-5"/> },
    { label: "Lista de Usuarios", href: "/dashboard/users/list", icon: <UsersIcon className="w-5 h-5"/> },
    { label: "Transacciones", href: "/dashboard/users/transactions", icon: <TransactionsIcon className="w-5 h-5"/> }, 
    { label: "Barra de Anuncios", href: "/dashboard/users/announcement-bar", icon: <MegaphoneIcon className="w-5 h-5"/> },
    { label: "Link de Registro", href: "/dashboard/users/register-url", icon: <LinkIcon className="w-5 h-5"/> },
  ];
  
  const configItems = useMemo(() => {
    const items: DropItem[] = [
        { label: "Mi Perfil", href: "/dashboard/profile", icon: <UserIcon className="w-5 h-5"/> },
        { label: "Datos de cuenta", href: "/dashboard/settings/account", icon: <IdentificationIcon className="w-5 h-5"/> },
        { label: "Seguridad / Clave", href: "/dashboard/settings/password", icon: <LockClosedIcon className="w-5 h-5"/> },
        { label: "Teléfono / WhatsApp", href: "/dashboard/settings/phone", icon: <DevicePhoneMobileIcon className="w-5 h-5"/> },
        { label: "Correo Electrónico", href: "/dashboard/settings/email", icon: <EnvelopeIcon className="w-5 h-5"/> },
    ];
    const role = session?.user?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SUPERUSER') {
        items.push({ label: "Tesorería Global", href: "/dashboard/super/treasury", icon: <ArrowsRightLeftIcon className="w-5 h-5"/> });
        items.push({ label: "Comisiones", href: "/dashboard/settings/commissions", icon: <CurrencyDollarIcon className="w-5 h-5"/> });
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
            <NavLink href="/" active={pathname === "/"} icon={<IconHome />}>INICIO</NavLink>
            <NavLink href="/dashboard/products" active={pathname.startsWith("/dashboard/products")} icon={<IconBox />}>PRODUCTOS</NavLink>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <Dropdown label="REPORTES" icon={<IconChart />} items={reportesItems} isActive={isReportActive} />
            <Dropdown label="COMPRAS" icon={<IconMoney />} items={comprasItems} isActive={isComprasActive} />
            <Dropdown label="CONFIGURACIÓN" icon={<IconConfig />} items={configItems} isActive={pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/profile") || isTreasuryPage} />
            <IfCan action="users:read:any"><Dropdown label="USUARIOS" icon={<IconUsers />} items={usuariosItems} isActive={pathname.startsWith("/dashboard/users")} /></IfCan>
            <IfCan action="roles:assign"><Dropdown label="DEBUG" icon={<IconCode />} items={[debugItem]} isActive={pathname.startsWith("/dashboard/rbac-test")} /></IfCan>
          </nav>
          <div className="flex items-center gap-3 pl-6 border-l border-white/10 ml-4">
              <Link href="/dashboard/help" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-100 hover:bg-white/10 hover:text-white transition-all"><IconInfo /> AYUDA</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black bg-white text-[#E33127] shadow-lg hover:bg-red-50 hover:shadow-xl transition-all"><IconPower /> SALIR</button>
          </div>
        </div>
      </div>
    </div>

    {/* 2. BARRA DE NAVEGACIÓN INFERIOR (Visible solo en Móvil/Tablet - lg:hidden) */}
    {/* AQUÍ MOVIMOS "MENÚ" AL 2DO LUGAR PARA QUE LA IA NO LO TAPE */}
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[40] flex items-center justify-around h-[60px] pb-1">
        
        {/* 1. Inicio */}
        <BottomNavItem href="/" icon={<HomeIcon />} label="Inicio" isActive={pathname === '/'} />
        
        {/* 2. MENÚ (AQUÍ ESTÁ A SALVO) */}
        <BottomNavItem onClick={() => setMobileMenuOpen(true)} icon={<QueueListIcon />} label="Menú" isActive={mobileMenuOpen} />

        {/* 3. Productos */}
        <BottomNavItem href="/dashboard/products" icon={<ShoppingBagIcon />} label="Productos" isActive={pathname.startsWith('/dashboard/products')} />
        
        {/* 4. Compras (Esquina derecha - si la IA lo tapa, no es tan grave como el menú) */}
        <BottomNavItem href="/dashboard/purchases/mine" icon={<WalletIcon />} label="Compras" isActive={isComprasActive} />
    </div>

    {/* 3. MENU DRAWER (Panel Lateral) */}
    {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col pb-20"> 
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#E33127] to-[#B91C1C] text-white">
              <span className="font-black text-xl tracking-tight">MOTO STORE</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <MobileNavGroup label="REPORTES" icon={<IconChart />} items={reportesItems} />
              <MobileNavGroup label="COMPRAS" icon={<IconMoney />} items={comprasItems} />
              <MobileNavGroup label="CONFIGURACIÓN" icon={<IconConfig />} items={configItems} />
              <IfCan action="users:read:any"><MobileNavGroup label="USUARIOS" icon={<IconUsers />} items={usuariosItems} /></IfCan>
              <Link href="/dashboard/help" className="flex items-center gap-3 px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                <span className="text-[#E33127]"><IconInfo /></span> AYUDA
              </Link>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 mb-14">
               <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-[#E33127] font-bold"><IconPower /> CERRAR SESIÓN</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
             




























