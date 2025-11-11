// src/app/ui/dashboard/nav-links-dashboard.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

function Item({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <Link
      href={href}
      className={[
        'block rounded-lg px-3 py-2 text-sm transition',
        active
          ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-700'
          : 'hover:bg-gray-50 text-slate-700',
        className,
      ].join(' ')}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

export default function NavLinksDashboard() {
  const pathname = usePathname();

  // Detecta si estás dentro de cada sección (solo para abrir por defecto)
  const purchasesDefaultOpen = useMemo(
    () =>
      pathname.startsWith('/dashboard/purchases') ||
      pathname.startsWith('/dashboard/payments') ||
      pathname.startsWith('/dashboard/wallet/withdraw'),
    [pathname]
  );

  const reportsDefaultOpen = useMemo(
    () => pathname.startsWith('/dashboard/reports'),
    [pathname]
  );

  const usersDefaultOpen = useMemo(
    () => pathname.startsWith('/dashboard/users'),
    [pathname]
  );

  const settingsDefaultOpen = useMemo(
    () => pathname.startsWith('/dashboard/settings'),
    [pathname]
  );

  return (
    <nav className="space-y-2">
      {/* OJO: apunta al dashboard, no a "/" */}
      <Item href="/dashboard">Inicio</Item>
      <Item href="/dashboard/products">Productos</Item>

      {/* Compras */}
      <details defaultOpen={purchasesDefaultOpen} className="rounded-lg">
        <summary
          className={[
            'list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition',
            purchasesDefaultOpen
              ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-700'
              : 'hover:bg-gray-50 text-slate-700',
          ].join(' ')}
        >
          Compras
        </summary>
        <div className="mt-1 ml-3 border-l pl-3 space-y-1">
          <Item href="/dashboard/purchases">Compras</Item>
          <Item href="/dashboard/purchases/report-payment">Reportar pago</Item>
          <Item href="/dashboard/payments/methods">Métodos de pago</Item>
          <Item href="/dashboard/purchases/mine">Mis compras</Item>
          <Item href="/dashboard/purchases/users">Compras de usuarios</Item>
          <Item href="/dashboard/wallet/withdraw">Retirar dinero</Item>
        </div>
      </details>

      {/* Reportes */}
      <details defaultOpen={reportsDefaultOpen} className="rounded-lg">
        <summary
          className={[
            'list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition',
            reportsDefaultOpen
              ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-700'
              : 'hover:bg-gray-50 text-slate-700',
          ].join(' ')}
        >
          Reportes
        </summary>
        <div className="mt-1 ml-3 border-l pl-3 space-y-1">
          <Item href="/dashboard/reports/general">General</Item>
          <Item href="/dashboard/reports/movimiento">Movimiento</Item>
          <Item href="/dashboard/reports/utilidades">Utilidades</Item>
          <Item href="/dashboard/reports/transactions">Transacciones</Item>
        </div>
      </details>

      {/* Usuarios */}
      <details defaultOpen={usersDefaultOpen} className="rounded-lg">
        <summary
          className={[
            'list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition',
            usersDefaultOpen
              ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-700'
              : 'hover:bg-gray-50 text-slate-700',
          ].join(' ')}
        >
          Usuarios
        </summary>
        <div className="mt-1 ml-3 border-l pl-3 space-y-1">
          <Item href="/dashboard/users">Usuarios</Item>
          <Item href="/dashboard/users/create">Crear cuenta</Item>
          <Item href="/dashboard/users/list">Lista de usuarios</Item>
          <Item href="/dashboard/users/register-url">URL de registro</Item>
          <Item href="/dashboard/users/announcement-bar">Barra informativa</Item>
          <Item href="/dashboard/users/transactions">Transacciones de usuarios</Item>
        </div>
      </details>

      {/* Configuración */}
      <details defaultOpen={settingsDefaultOpen} className="rounded-lg">
        <summary
          className={[
            'list-none rounded-lg px-3 py-2 text-sm cursor-pointer select-none transition',
            settingsDefaultOpen
              ? 'bg-orange-50 ring-1 ring-orange-300 text-orange-700'
              : 'hover:bg-gray-50 text-slate-700',
          ].join(' ')}
        >
          Configuración
        </summary>
        <div className="mt-1 ml-3 border-l pl-3 space-y-1">
          <Item href="/dashboard/settings/account">Datos de cuenta</Item>
          <Item href="/dashboard/settings/password">Cambio de clave</Item>
          <Item href="/dashboard/settings/phone">Teléfono SMS y/o Whatsapp</Item>
          <Item href="/dashboard/settings/email">Correo electrónico</Item>
          <Item href="/dashboard/settings/commissions">Comisiones</Item>
        </div>
      </details>
    </nav>
  );
}











