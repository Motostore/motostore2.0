'use client';

import {
  HomeIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  ArrowRightEndOnRectangleIcon,
  CalculatorIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const BRAND_RED_TEXT = 'text-[#E33127]';
const BRAND_RED_BG_LIGHT = 'bg-[#FFF5F4]'; 
const BRAND_RED_SOLID_BG = 'bg-[#E33127]'; 
const BRAND_RED_SOLID_HOVER = 'hover:bg-[#C52B22]'; 

// 1. SOLUCIÓN: Definimos un tipo flexible para los items del menú
type LinkItem = {
  key: string;
  name: string;
  href: string;
  icon: any; // Usamos any para evitar conflictos con tipos de íconos
  isSeparator?: boolean;
  isButton?: boolean;
  action?: () => void; // Permitimos la función de acción
};

// 2. Aplicamos el tipo a la lista inicial
const links: LinkItem[] = [
  { key: 'home', name: 'Inicio', href: '/', icon: HomeIcon },
  { key: 'about', name: 'Quiénes somos', href: '/QuienesSomos', icon: UsersIcon },
  { key: 'help', name: 'Cómo funciona', href: '/como-funciona', icon: QuestionMarkCircleIcon },
  { key: 'calculadora-paypal', name: 'Calc. PayPal', href: '/calculadorapaypal', icon: CalculatorIcon },
  { key: 'Registro', name: 'Registro', href: '/Registro', icon: UserPlusIcon, isSeparator: true },
  { key: 'login', name: 'Acceso', href: '/login', icon: ArrowRightEndOnRectangleIcon, isButton: true },
];

export default function NavLinks() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 3. Tipamos explícitamente esta variable también
  let menuLinks: LinkItem[] = [...links];
  
  // SI EL USUARIO ESTÁ LOGUEADO:
  if (session?.user) {
    menuLinks = [
      { key: 'dashboard', name: 'Tablero', href: '/dashboard', icon: HomeIcon },
      { key: 'announcements', name: 'Anuncios', href: '/dashboard/users/announcement-bar', icon: MegaphoneIcon },
      { key: 'about', name: 'Quiénes somos', href: '/QuienesSomos', icon: UsersIcon },
      { key: 'help', name: 'Ayuda', href: '/ayuda', icon: QuestionMarkCircleIcon },
      { key: 'calculadora-paypal', name: 'Calc. PayPal', href: '/calculadorapaypal', icon: CalculatorIcon },
      // Ahora TypeScript acepta que este objeto tenga isButton, isSeparator y action al mismo tiempo
      { key: 'logout', name: 'Salir', href: '#', icon: ArrowRightOnRectangleIcon, isButton: true, isSeparator: true, action: () => signOut({ callbackUrl: '/' }) },
    ];
  }

  const baseClasses = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ';

  return (
    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-0 w-full justify-end">
      {menuLinks.map((link, index) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        let currentClasses = baseClasses;

        if (link.isButton) {
          currentClasses += `${BRAND_RED_SOLID_BG} text-white shadow-md ${BRAND_RED_SOLID_HOVER}`;
        } else {
          currentClasses += isActive 
            ? `${BRAND_RED_TEXT} ${BRAND_RED_BG_LIGHT}`
            : 'text-gray-600 hover:text-red-600 hover:bg-gray-50';
        }

        const separator = link.isSeparator ? (
          <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
        ) : null;

        if (link.action) {
          return (
            <div key={link.key} className="flex items-center">
              {separator}
              <button onClick={link.action} className={currentClasses}>
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </button>
            </div>
          );
        }

        return (
          <div key={link.key} className="flex items-center">
             {separator}
             <Link href={link.href} className={currentClasses}>
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
             </Link>
          </div>
        );
      })}
    </div>
  );
}



















