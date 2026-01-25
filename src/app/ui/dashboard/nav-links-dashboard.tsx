'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Importación limpia y verificada de HeroIcons v2
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
  PlayCircleIcon, // Agregado para Streaming
  TicketIcon      // Agregado para Historial
} from '@heroicons/react/24/outline';

// Importación de tu componente RBAC
import IfCan from '../../rbac/IfCan'; 

function Item({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string; }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

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

      {/* --- NUEVA SECCIÓN DE VENTAS (Separada para claridad) --- */}
      
      {/* 1. Tienda (Donde compran) */}
      <Item href="/dashboard/store">
        <span className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5"/> Tienda Oficial
        </span>
      </Item>

      {/* 2. Streaming (Donde consumen lo comprado) */}
      <Item href="/dashboard/products/streaming">
        <span className="flex items-center gap-2">
            <PlayCircleIcon className="w-5 h-5"/> Mis Suscripciones
        </span>
      </Item>

      {/* --- MENÚ DE COMPRAS (Finanzas) --- */}
      <details open={purchasesOpen} className="group pt-2">
        <summary className={summaryClass(purchasesOpen)}>
          <TicketIcon className="w-5 h-5"/> Finanzas / Compras
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
          <Item href="/dashboard/purchases">Historial Global</Item>
          
          {/* Opción protegida: Solo Admins */}
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

      {/* --- MENÚ DE REPORTES --- */}
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

      {/* --- MENÚ DE USUARIOS --- */}
      {/* Protegemos el menú completo de usuarios para que no lo vean clientes normales */}
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

      {/* --- MENÚ DE CONFIGURACIÓN --- */}
      <details className="group pt-1">
        <summary className="flex items-center gap-2 list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition-all duration-200 font-bold hover:bg-gray-50 text-slate-700 hover:text-black">
        <Cog6ToothIcon className="w-5 h-5"/> Configuración
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
        <Item href="/dashboard/profile"><span className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> Mi Perfil</span></Item>
        <Item href="/dashboard/settings/account"><span className="flex items-center gap-2"><IdentificationIcon className="w-5 h-5"/> Datos de cuenta</span></Item>
        <Item href="/dashboard/settings/password"><span className="flex items-center gap-2"><LockClosedIcon className="w-5 h-5"/> Seguridad / Clave</span></Item>
        <Item href="/dashboard/settings/phone"><span className="flex items-center gap-2"><DevicePhoneMobileIcon className="w-5 h-5"/> Teléfono / WhatsApp</span></Item>
        <Item href="/dashboard/settings/email"><span className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5"/> Correo Electrónico</span></Item>
        
        {/* Solo Admin ve Comisiones */}
        <IfCan permission="manage_users">
            <Item href="/dashboard/settings/commissions"><span className="flex items-center gap-2"><BanknotesIcon className="w-5 h-5"/> Comisiones</span></Item>
        </IfCan>
        </div>
      </details>

    </nav>
  );
}








