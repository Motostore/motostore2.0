'use client';

import { usePathname } from "next/navigation";
import clsx from 'clsx';
import { signOut, useSession } from "next-auth/react";
import {
  HomeIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

// Definir los enlaces de navegación
const links = [
  {
    key: 'home',
    name: 'Inicio',
    href: '/',
    icon: HomeIcon,
  },
  {
    key: 'about',
    name: 'Quiénes somos',
    href: '/QuienesSomos', // <--- ¡CORREGIDO AQUÍ!
    icon: UserGroupIcon,
  },
  {
    key: 'help',
    name: 'Cómo funciona',
    href: '/help',
    icon: QuestionMarkCircleIcon,
  },
  {
    key: 'calculadora-paypal',
    name: 'Calculadora PayPal',
    href: '/calculadora-comisiones-paypal', // <--- ¡CORREGIDO AQUÍ!
    icon: CalculatorIcon,
  },
  {
    key: 'register',
    name: 'Registro',
    href: '/register',
    icon: UserPlusIcon,
  },
  {
    key: 'login',
    name: 'Acceso',
    href: '/login',
    icon: ArrowRightOnRectangleIcon,
  },
];

export default function NavLinks() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Si el usuario está autenticado, se actualizan los enlaces de navegación
  let menuLinks = [...links];
  if (session?.user) {
    // Si el usuario está logueado, reemplazamos 'Registro' y 'Acceso' con 'Tablero' y 'Salir'
    // También nos aseguramos de que 'Quiénes somos' y otros enlaces principales se mantengan.
    menuLinks = [
      menuLinks.find(link => link.key === 'home'),
      menuLinks.find(link => link.key === 'about'),
      menuLinks.find(link => link.key === 'help'),
      menuLinks.find(link => link.key === 'calculadora-paypal'),
      {
        key: 'dashboard',
        name: 'Tablero',
        href: '/dashboard',
        icon: HomeIcon,
      },
      {
        key: 'logout',
        name: 'Salir',
        href: '#',
        icon: ArrowRightOnRectangleIcon,
        action: () => signOut({ callbackUrl: '/', redirect: true }),
      }
    ].filter(Boolean);
  }

  return (
    <>
      {menuLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

        return (
          <a
            key={link.key}
            href={link.href}
            onClick={link.action ? link.action : undefined}
            className={clsx(
              "flex h-[48px] items-center text-gray-500 font-bold justify-center gap-2 rounded-md p-3 text-sm hover:bg-gray-500 md:hover:bg-gray-500 md:hover:text-white md:flex-none md:justify-start md:p-2 md:px-3",
              {
                'bg-gray-500 text-white': isActive,
                'text-orange-500': !isActive,
              }
            )}
          >
            {Icon && <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-orange-500")} />}
            <span className="md:block">{link.name}</span>
          </a>
        );
      })}
    </>
  );
}



















