'use client';

import {
  HomeIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  ArrowRightEndOnRectangleIcon, // Icono para Login (Entrar)
  CalculatorIcon,
  ArrowRightOnRectangleIcon,    // Icono para Logout (Salir)
  Squares2X2Icon,               // Icono para Tablero/Dashboard
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx'; // Asegúrate de tener clsx instalado, si no, usa template literals normales

// --- CONSTANTES DE MARCA ---
const BRAND_RED_TEXT = 'text-[#E33127]';
const BRAND_RED_BG_LIGHT = 'bg-[#FFF5F4]'; 
const BRAND_RED_SOLID_BG = 'bg-[#E33127]'; 
const BRAND_RED_SOLID_HOVER = 'hover:bg-[#C52B22]'; 

// --- TIPOS ---
type LinkItem = {
  key: string;
  name: string;
  href: string;
  icon: React.ElementType; // Tipo correcto para iconos de HeroIcons
  isSeparator?: boolean;
  isButton?: boolean;
  action?: () => void;
};

// --- ENLACES PÚBLICOS (Invitados) ---
const publicLinks: LinkItem[] = [
  { key: 'home', name: 'Inicio', href: '/', icon: HomeIcon },
  { key: 'about', name: 'Quiénes somos', href: '/QuienesSomos', icon: UsersIcon },
  { key: 'help', name: 'Cómo funciona', href: '/como-funciona', icon: QuestionMarkCircleIcon },
  { key: 'calculadora-paypal', name: 'Calc. PayPal', href: '/calculadorapaypal', icon: CalculatorIcon },
  { key: 'Registro', name: 'Registro', href: '/Registro', icon: UserPlusIcon, isSeparator: true },
  { key: 'login', name: 'Acceso', href: '/login', icon: ArrowRightEndOnRectangleIcon, isButton: true },
];

export default function HeaderLinks() {
  const { data: session } = useSession();
  const pathname = usePathname();

  let menuLinks: LinkItem[] = [...publicLinks];
  
  // --- ENLACES DE USUARIO LOGUEADO ---
  if (session?.user) {
    menuLinks = [
      // Al estar logueado, lo principal es ir al Dashboard
      { key: 'dashboard', name: 'Mi Tablero', href: '/dashboard', icon: Squares2X2Icon },
      
      // Mantenemos accesos útiles
      { key: 'calculadora-paypal', name: 'Calc. PayPal', href: '/calculadorapaypal', icon: CalculatorIcon },
      { key: 'help', name: 'Ayuda', href: '/ayuda', icon: QuestionMarkCircleIcon },

      // Botón de Salir
      { 
        key: 'logout', 
        name: 'Cerrar Sesión', 
        href: '#', 
        icon: ArrowRightOnRectangleIcon, 
        isButton: true, 
        isSeparator: true, 
        action: () => signOut({ callbackUrl: '/' }) 
      },
    ];
  }

  return (
    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 w-full justify-end scrollbar-hide">
      {menuLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        // Clases base
        const linkClasses = clsx(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
          {
            // Estilos si es Botón (Login/Logout)
            [`${BRAND_RED_SOLID_BG} text-white shadow-md shadow-red-500/20 ${BRAND_RED_SOLID_HOVER}`]: link.isButton,
            
            // Estilos si es Link Activo (y no es botón)
            [`${BRAND_RED_TEXT} ${BRAND_RED_BG_LIGHT} font-bold ring-1 ring-red-100`]: !link.isButton && isActive,
            
            // Estilos normales (Inactivo)
            'text-slate-600 hover:text-[#E33127] hover:bg-slate-50': !link.isButton && !isActive,
          }
        );

        return (
          <div key={link.key} className="flex items-center">
             {/* Separador Visual */}
             {link.isSeparator && <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>}

             {link.action ? (
                // Caso: Botón con Acción (Logout)
                <button onClick={link.action} className={linkClasses}>
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{link.name}</span>
                </button>
             ) : (
                // Caso: Link Normal
                <Link href={link.href} className={linkClasses}>
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
             )}
          </div>
        );
      })}
    </div>
  );
}


















