'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import {
  HomeIcon, ShoppingBagIcon, DocumentChartBarIcon, UserGroupIcon, 
  Cog6ToothIcon, MegaphoneIcon, CodeBracketIcon, 
  UserIcon, IdentificationIcon, LockClosedIcon, DevicePhoneMobileIcon, 
  EnvelopeIcon, BanknotesIcon,
  // 👇 Importamos iconos adicionales para funciones nuevas
  CheckBadgeIcon, ArrowDownCircleIcon, WalletIcon 
} from '@heroicons/react/24/outline';

// Importamos IfCan desde la ruta correcta (ajusta si es necesario)
import IfCan from '../../rbac/IfCan'; 

function Item({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string; }) {
  const pathname = usePathname();
  // Lógica Premium: Activo si es exacto O si es una sub-ruta directa
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

  // 🕵️ DETECTIVE DE RUTAS: Rutas relacionadas con pagos y wallet
  const isPaymentReportPage = pathname.startsWith('/dashboard/reports/payment');
  const isWalletAdminPage = pathname.startsWith('/dashboard/wallet/admin-withdrawals'); 
  const isPaymentsApprovalsPage = pathname.startsWith('/dashboard/payments/approvals');

  // 1. LÓGICA COMPRAS (ULTRA PRO)
  const purchasesOpen = useMemo(() => 
    pathname.startsWith('/dashboard/purchases') || 
    pathname.startsWith('/dashboard/payment-methods') || 
    pathname.startsWith('/dashboard/wallet') ||
    isPaymentsApprovalsPage || 
    isWalletAdminPage ||       
    isPaymentReportPage, 
  [pathname, isPaymentReportPage, isPaymentsApprovalsPage, isWalletAdminPage]);

  // 2. LÓGICA REPORTES (ULTRA PRO)
  const reportsOpen = useMemo(() => 
    pathname.startsWith('/dashboard/reports') && 
    !isPaymentReportPage, 
  [pathname, isPaymentReportPage]);

  const usersOpen = useMemo(() => 
    pathname.startsWith('/dashboard/users'), 
  [pathname]);

  // Estilo dinámico para el encabezado del menú desplegable
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

      <Item href="/dashboard/users/announcement-bar">
        <span className="flex items-center gap-2"><MegaphoneIcon className="w-5 h-5"/> Barra de Anuncios</span>
      </Item>

      <Item href="/dashboard/products">
        <span className="flex items-center gap-2"><ShoppingBagIcon className="w-5 h-5"/> Productos</span>
      </Item>

      {/* --- MENÚ DE COMPRAS (El protagonista) --- */}
      <details open={purchasesOpen} className="group">
        <summary className={summaryClass(purchasesOpen)}>
          <ShoppingBagIcon className="w-5 h-5"/> Compras
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
          <Item href="/dashboard/purchases">Listado de Compras</Item>
          
          {/* ✅ CORRECCIÓN: Usamos 'payments:verify' en lugar de 'payments:approve' para evitar el error de tipos */}
          <IfCan action="payments:verify">
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
          
          {/* ENLACES DE USUARIO */}
          <Item href="/dashboard/reports/payment">Reportar Pago</Item>
          <Item href="/dashboard/wallet/withdraw">
            <span className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-blue-500"/> Mi Billetera / Retirar
            </span>
          </Item>
          <Item href="/dashboard/purchases/mine">Mis Compras</Item>
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
      <details open={usersOpen} className="group pt-1">
        <summary className={summaryClass(usersOpen)}>
          <UserGroupIcon className="w-5 h-5"/> Usuarios
        </summary>
        <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
          <Item href="/dashboard/users">Panel Usuarios</Item>
          <Item href="/dashboard/users/create">Crear Cuenta</Item>
          <Item href="/dashboard/users/list">Lista de Usuarios</Item>
          <Item href="/dashboard/users/register-url">URL de Registro</Item>
          <Item href="/dashboard/users/transactions">Transacciones Usuarios</Item>
        </div>
      </details>

      {/* --- MENÚ DE CONFIGURACIÓN (Protegido) --- */}
      <IfCan action="users:read:any">
        <details className="group pt-1">
          <summary className="flex items-center gap-2 list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition-all duration-200 font-bold hover:bg-gray-50 text-slate-700 hover:text-black">
            <Cog6ToothIcon className="w-5 h-5"/> Configuración
          </summary>
          <div className="mt-1 ml-3 border-l-2 border-slate-100 pl-3 space-y-1">
            <Item href="/dashboard/settings/profile"><span className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> Mi Perfil</span></Item>
            <Item href="/dashboard/settings/account"><span className="flex items-center gap-2"><IdentificationIcon className="w-5 h-5"/> Datos de cuenta</span></Item>
            <Item href="/dashboard/settings/password"><span className="flex items-center gap-2"><LockClosedIcon className="w-5 h-5"/> Seguridad / Clave</span></Item>
            <Item href="/dashboard/settings/phone"><span className="flex items-center gap-2"><DevicePhoneMobileIcon className="w-5 h-5"/> Teléfono / WhatsApp</span></Item>
            <Item href="/dashboard/settings/email"><span className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5"/> Correo Electrónico</span></Item>
            <Item href="/dashboard/settings/commissions"><span className="flex items-center gap-2"><BanknotesIcon className="w-5 h-5"/> Comisiones</span></Item>
          </div>
        </details>
      </IfCan>

      <Item href="/dashboard/rbac-test" className="mt-2 pt-2 border-t border-slate-200 bg-red-800 hover:bg-red-700">
        <span className="flex items-center gap-2 text-yellow-300 font-bold">
          <CodeBracketIcon className="w-5 h-5"/> 🛑 DEBUG BYPASS
        </span>
      </Item>
    </nav>
  );
}










