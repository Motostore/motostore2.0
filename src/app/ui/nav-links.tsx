'use client';

import {
  HomeIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

type LinkItem = {
  key: string;
  name: string;
  href: string;
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  action?: () => void;
};

// Enlaces públicos (cuando NO hay sesión)
const links: LinkItem[] = [
  { key: 'home', name: 'Inicio', href: '/', icon: HomeIcon },
  { key: 'about', name: 'Quiénes somos', href: '/QuienesSomos', icon: UsersIcon },
  { key: 'help', name: 'Cómo funciona', href: '/ayuda', icon: QuestionMarkCircleIcon },
  { key: 'calculadora-paypal', name: 'Calculadora PayPal', href: '/calculadora-comisiones-paypal', icon: CalculatorIcon },
  { key: 'Registro', name: 'Registro', href: '/Registro', icon: UserPlusIcon },
  { key: 'login', name: 'Acceso', href: '/login', icon: ArrowRightOnRectangleIcon },
];

export default function NavLinks() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Menú cuando HAY sesión
  let menuLinks: LinkItem[] = [...links];
  if (session?.user) {
    menuLinks = [
      { key: 'home', name: 'Inicio', href: '/', icon: HomeIcon },
      { key: 'about', name: 'Quiénes somos', href: '/QuienesSomos', icon: UsersIcon },
      { key: 'help', name: 'Cómo funciona', href: '/ayuda', icon: QuestionMarkCircleIcon },
      { key: 'calculadora-paypal', name: 'Calculadora PayPal', href: '/calculadora-comisiones-paypal', icon: CalculatorIcon },
      { key: 'dashboard', name: 'Tablero', href: '/dashboard', icon: HomeIcon },
      {
        key: 'logout',
        name: 'Salir',
        href: '#',
        icon: ArrowRightOnRectangleIcon,
        action: () => signOut({ callbackUrl: '/', redirect: true }),
      },
    ];
  }

  return (
    <>
      {menuLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === '/'
          ? pathname === '/'
          : pathname.startsWith(link.href);

        const baseClasses =
          'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[15px] font-semibold transition';
        const classes = clsx(
          baseClasses,
          isActive
            ? 'bg-[var(--brand)] text-white shadow-sm'
            : 'text-slate-700 hover:text-[var(--brand)]'
        );
        const iconClasses = clsx(
          'w-5 h-5',
          isActive ? 'text-white' : 'text-[var(--brand)]'
        );

        // Si el item tiene acción (Logout), renderizamos botón
        if (link.action) {
          return (
            <button
              key={link.key}
              type="button"
              onClick={link.action}
              className={classes}
              aria-label={link.name}
            >
              <Icon className={iconClasses} />
              <span>{link.name}</span>
            </button>
          );
        }

        // Si no, renderizamos Link normal
        return (
          <Link key={link.key} href={link.href} className={classes}>
            <Icon className={iconClasses} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </>
  );
}




















