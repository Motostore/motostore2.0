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
    href: '/about',
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
    href: '/calculadora-paypal',
    icon: CalculatorIcon,
  },
  {
    key: 'register',
    name: 'Registro', // <-- CAMBIO AQUI
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
  const { data: session } = useSession(); // Obtener la sesión del usuario
  const pathname = usePathname(); // Obtener la ruta actual de la página

  // Si el usuario está autenticado, se actualizan los enlaces de navegación
  let menuLinks = [...links];
  if (session?.user) {
    menuLinks = [
      ...links.slice(0, 4), // Hasta "Calculadora PayPal"
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
        action: () => signOut({ callbackUrl: '/', redirect: true }), // Acción de cerrar sesión
      }
    ];
  }

  return (
    <>
      {menuLinks.map((link) => {
        const Icon = link.icon; // Obtener el ícono del enlace
        const isActive =
          link.href === '/' ? pathname === '/' : pathname === link.href; // Verificar si el enlace está activo

        return (
          <a
            key={link.key}
            href={link.href}
            onClick={link.action ? link.action : undefined} // Ejecutar la acción de logout si es necesario
            className={clsx(
              "flex h-[48px] items-center text-gray-500 font-bold justify-center gap-2 rounded-md p-3 text-sm hover:bg-gray-500 md:hover:bg-gray-500 md:hover:text-white md:flex-none md:justify-start md:p-2 md:px-3",
              {
                'bg-gray-500 text-white': isActive, // Clases cuando el enlace está activo
                'text-orange-500': !isActive, // Clases cuando el enlace no está activo
              }
            )}
          >
            <Icon className={clsx("w-5 h-5", isActive ? "text-black" : "text-orange-500")} />
            <span className="md:block">{link.name}</span>
          </a>
        );
      })}
    </>
  );
}



















