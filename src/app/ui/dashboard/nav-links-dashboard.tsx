'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Importación limpia de HeroIcons
import {
  HomeIcon, 
  ShoppingBagIcon, 
  DocumentChartBarIcon, 
  UserGroupIcon, 
  Cog6ToothIcon, 
  MegaphoneIcon, 
  UserIcon, 
  IdentificationIcon, 
  LockClosedIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon, 
  BanknotesIcon,
  CheckBadgeIcon, 
  ArrowDownCircleIcon, 
  WalletIcon,
  PlayCircleIcon, 
  TicketIcon
} from '@heroicons/react/24/outline';

// Importación de tu componente RBAC
import IfCan from '../../rbac/IfCan'; 

function Item({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string; }) {
  const pathname = usePathname();
  // Lógica mejorada para detectar pestañas activas
  const active = pathname === href || (href.includes('?') && pathname + window.location.search === href);

  return (
    <Link
      href={href}
      className={[
        'block rounded-lg px-3 py-2 text-sm transition-all duration-200 font-medium',
        active
          ? 'bg-red-50 ring-1 ring-red-200 text-[#E33127] font-bold shadow-sm translate-x-1'
          : 'hover:bg-gray-50 text-slate-600 hover:text-[#E33127] hover:translate-x-1',
        className
      ].filter(Boolean).join(' ')}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

export default function NavLinksDashboard() {
  const pathname = usePathname();

  const isPaymentReportPage = pathname.startsWith('/dashboard/reports/payment');
  const isWalletAdminPage = pathname.startsWith('/dashboard/wallet/admin-withdrawals'); 
  const isPaymentsApprovalsPage = pathname.startsWith('/dashboard/payments/approvals');

  const purchasesOpen = useMemo(() => 
    pathname.startsWith('/dashboard/purchases') || 
    pathname.startsWith('/dashboard/payment-methods') || 
    pathname.startsWith('/dashboard/wallet') ||
    isPaymentsApprovalsPage || 
    isWalletAdminPage ||       
    isPaymentReportPage, 
  [pathname, isPaymentReportPage, isPaymentsApprovalsPage, isWalletAdminPage]);

  const reportsOpen = useMemo(() => 
    pathname.startsWith('/dashboard/reports') && 
    !isPaymentReportPage, 
  [pathname, isPaymentReportPage]);

  const usersOpen = useMemo(() => 
    pathname.startsWith('/dashboard/users'), 
  [pathname]);

  const summaryClass = (isOpen: boolean) => [
    'flex items-center gap-2 list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition-all duration-200 font-bold',
    isOpen
      ? 'bg-red-50 ring-1 ring-red-200 text-[#E33127] shadow-sm'
      : 'hover:bg-gray-50 text-slate-700 hover:text-black',
  ].join(' ');

  return (
    <nav className="space-y-1 animate-in fade-in duration-300">
      <Item href="/dashboard">
        <span className="flex items-center gap-2"><HomeIcon className="w-5 h-5"/> Inicio</span>
      </Item>

      {/* --- TIENDA --- */}
      <Item href="/dashboard/store">
        <span className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5"/> Tienda Oficial
        </span>
      </Item>

      <Item href="/dashboard/products/streaming">
        <span className="flex items-center gap-2">
            <PlayCircleIcon className="w-5 h-5"/> Mis Suscripciones
        </span>
      </Item>

      {/* --- FINANZAS --- */}
      <details open={purchasesOpen} className="group pt-2">
        <summary className={summaryClass(purchasesOpen)}>
          <TicketIcon className="w-5 h-5"/> Finanzas / Compras
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
          <Item href="/dashboard/purchases">Historial Global</Item>
          
          <IfCan permission="manage_payments">
            <Item href="/dashboard/payments/approvals">
                <span className="flex items-center gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-emerald-500"/> Aprobar Pagos
                </span>
            </Item>
            <Item href="/dashboard/wallet/admin-withdrawals">
                <span className="flex items-center gap-2">
                    <ArrowDownCircleIcon className="w-5 h-5 text-red-500"/> Admin Retiros
                </span>
            </Item>
          </IfCan>
          
          <Item href="/dashboard/reports/payment">Reportar Pago</Item>
          <Item href="/dashboard/wallet/withdraw">
            <span className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-blue-500"/> Mi Billetera / Retirar
            </span>
          </Item>
          <Item href="/dashboard/purchases/mine">Mis Recibos</Item>
          <Item href="/dashboard/payment-methods">Métodos de Pago</Item>
        </div>
      </details>

      {/* --- REPORTES --- */}
      <details open={reportsOpen} className="group pt-1">
        <summary className={summaryClass(reportsOpen)}>
          <DocumentChartBarIcon className="w-5 h-5"/> Reportes
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
          <Item href="/dashboard/reports/general">General</Item>
          <Item href="/dashboard/reports/movimiento">Movimiento</Item>
          <Item href="/dashboard/reports/utilidades">Utilidades</Item> 
          <Item href="/dashboard/reports/transactions">Transacciones</Item>
        </div>
      </details>

      {/* --- USUARIOS --- */}
      <IfCan permission="manage_users">
        <details open={usersOpen} className="group pt-1">
            <summary className={summaryClass(usersOpen)}>
            <UserGroupIcon className="w-5 h-5"/> Usuarios
            </summary>
            <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
            <Item href="/dashboard/users/create">Crear Cuenta</Item>
            <Item href="/dashboard/users/list">Lista de Usuarios</Item>
            <Item href="/dashboard/users/announcement-bar">
                <span className="flex items-center gap-2"><MegaphoneIcon className="w-5 h-5"/> Barra de Anuncios</span>
            </Item>
            <Item href="/dashboard/users/register-url">URL de Registro</Item>
            <Item href="/dashboard/users/transactions">Transacciones Usuarios</Item>
            </div>
        </details>
      </IfCan>

      {/* --- CONFIGURACIÓN (AQUÍ ESTABAN LOS ERRORES) --- */}
      <details className="group pt-1">
        <summary className="flex items-center gap-2 list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition-all duration-200 font-bold hover:bg-gray-50 text-slate-700 hover:text-black">
        <Cog6ToothIcon className="w-5 h-5"/> Configuración
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
            <Item href="/dashboard/profile">
                <span className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> Mi Perfil</span>
            </Item>
            
            {/* ✅ CORREGIDO: Redirige a la pestaña 'profile' del settings unificado */}
            <Item href="/dashboard/settings?tab=profile">
                <span className="flex items-center gap-2"><IdentificationIcon className="w-5 h-5"/> Datos Personales</span>
            </Item>

            {/* Este apunta a Mis Cuentas Bancarias (DEBE EXISTIR EL ARCHIVO) */}
            <Item href="/dashboard/settings/account">
                <span className="flex items-center gap-2"><BanknotesIcon className="w-5 h-5"/> Cuentas Bancarias</span>
            </Item>
            
            {/* ✅ CORREGIDO: Redirige a la pestaña 'security' */}
            <Item href="/dashboard/settings?tab=security">
                <span className="flex items-center gap-2"><LockClosedIcon className="w-5 h-5"/> Seguridad / Clave</span>
            </Item>
            
            {/* ✅ CORREGIDO: Redirige a la pestaña 'phone' */}
            <Item href="/dashboard/settings?tab=phone">
                <span className="flex items-center gap-2"><DevicePhoneMobileIcon className="w-5 h-5"/> Teléfono / WhatsApp</span>
            </Item>
            
            {/* ✅ CORREGIDO: Redirige a la pestaña 'email' */}
            <Item href="/dashboard/settings?tab=email">
                <span className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5"/> Correo Electrónico</span>
            </Item>
            
            <IfCan permission="manage_users">
                {/* ESTE DEBE EXISTIR FÍSICAMENTE EN /settings/commissions */}
                <Item href="/dashboard/settings/commissions">
                    <span className="flex items-center gap-2"><BanknotesIcon className="w-5 h-5"/> Comisiones</span>
                </Item>
            </IfCan>
        </div>
      </details>

    </nav>
  );
}








