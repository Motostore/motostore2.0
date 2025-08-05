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
    href: '/QuienesSomos', // <--- ¡CAMBIADO AQUÍ! Ahora apunta a /QuienesSomos
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
  const { data: session } = useSession(); // Obtener la sesión del usuario
  const pathname = usePathname(); // Obtener la ruta actual de la página

  // Si el usuario está autenticado, se actualizan los enlaces de navegación
  let menuLinks = [...links];
  if (session?.user) {
    // Si el usuario está logueado, reemplazamos 'Registro' y 'Acceso' con 'Tablero' y 'Salir'
    // También nos aseguramos de que 'Quiénes somos' y otros enlaces principales se mantengan.
    menuLinks = [
      menuLinks.find(link => link.key === 'home'), // Inicio
      menuLinks.find(link => link.key === 'about'), // Quiénes somos
      menuLinks.find(link => link.key === 'help'), // Cómo funciona
      menuLinks.find(link => link.key === 'calculadora-paypal'), // Calculadora PayPal
      {
        key: 'dashboard',
        name: 'Tablero', // Este es el enlace al dashboard
        href: '/dashboard',
        icon: HomeIcon,
      },
      {
        key: 'logout',
        name: 'Salir',
        href: '#', // '#' para que no navegue, ya que la acción es un onClick
        icon: ArrowRightOnRectangleIcon,
        action: () => signOut({ callbackUrl: '/', redirect: true }), // Acción de cerrar sesión
      }
    ].filter(Boolean); // Filtra cualquier enlace que pueda ser undefined si no se encuentra
  }

  return (
    <>
      {menuLinks.map((link) => {
        const Icon = link.icon; // Obtener el ícono del enlace
        // isActive: Verifica si la ruta actual coincide con el href del enlace.
        // Para la página de inicio ('/'), solo es activo si el pathname es exactamente '/'.
        // Para otras páginas, es activo si el pathname comienza con el href del enlace (para subrutas).
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

        return (
          <a
            key={link.key}
            href={link.href}
            onClick={link.action ? link.action : undefined} // Ejecutar la acción de logout si es necesario
            className={clsx(
              "flex h-[48px] items-center text-gray-500 font-bold justify-center gap-2 rounded-md p-3 text-sm hover:bg-gray-500 md:hover:bg-gray-500 md:hover:text-white md:flex-none md:justify-start md:p-2 md:px-3",
              {
                'bg-gray-500 text-white': isActive, // Clases cuando el enlace está activo
                'text-orange-500': !isActive, // Clases cuando el enlace no está activo (si no está activo, su color es naranja)
              }
            )}
          >
            {/* Renderiza el ícono si está presente */}
            {Icon && <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-orange-500")} />}
            {/* Asegúrate de que el span para el nombre del enlace siempre exista para el layout */}
            <span className="md:block">{link.name}</span>
          </a>
        );
      })}
    </>
  );
}



















