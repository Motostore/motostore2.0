"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  HomeIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  CalculatorIcon,
  ArrowRightEndOnRectangleIcon,
  ComputerDesktopIcon,
  UserPlusIcon, 
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  UserPlusIcon as UserPlusIconSolid, 
  ArrowRightEndOnRectangleIcon as ArrowRightEndOnRectangleIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
} from "@heroicons/react/24/solid";
import { usePathname } from 'next/navigation';

export default function NavigationHome() {
  const { status } = useSession();
  const pathname = usePathname();

  // --- ESTILOS ---
  const ACTIVE_COLOR = 'text-red-600';
  const INACTIVE_COLOR = 'text-slate-600 group-hover:text-red-600';
  
  // Estilos para Desktop
  const desktopLinkBase = "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 group";
  const desktopIconBase = "w-5 h-5 shrink-0 transition-transform";

  // --- CONFIGURACIÓN DE ENLACES (Base para Mobile y Desktop) ---
  const allLinks = [
    { name: 'Inicio', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Quiénes somos', href: '/QuienesSomos', icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
    { name: 'Ayuda', href: '/ayuda', icon: QuestionMarkCircleIcon, activeIcon: QuestionMarkCircleIconSolid },
    { name: 'Calculadora', href: '/calculadorapaypal', icon: CalculatorIcon, activeIcon: CalculatorIconSolid },
    { name: 'Registro', href: '/Registro', icon: UserPlusIcon, activeIcon: UserPlusIconSolid },
  ];
  
  // Componente de Botón de Navegación Móvil
  const MobileNavLink = ({ link }: { link: typeof allLinks[0] }) => {
    const isActive = pathname === link.href;
    const IconComponent = isActive ? link.activeIcon : link.icon;

    return (
      <Link 
        href={link.href}
        className={`group flex flex-col items-center p-1.5 transition-colors ${isActive ? ACTIVE_COLOR : INACTIVE_COLOR}`}
      >
        <IconComponent className="w-6 h-6 shrink-0" />
        <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-red-700' : 'text-slate-600'}`}>
          {link.name.split(' ')[0]}
        </span>
      </Link>
    );
  };

  // --- LÓGICA DE VISIBILIDAD MÓVIL (Barra Inferior) ---
  
  let mobileLinks;
  
  if (status === "authenticated") {
      // Si está logueado: Mostrar Inicio y Calculadora.
      // Ocultamos Registro, Quiénes somos y Ayuda.
      mobileLinks = allLinks.filter(link => 
          link.name === 'Inicio' || 
          link.name === 'Calculadora'
      );
  } else {
      // Si NO está logueado: Mostrar Inicio, Calculadora y Registro.
      // Ocultamos Quiénes somos y Ayuda.
      mobileLinks = allLinks.filter(link => 
          link.name === 'Inicio' || 
          link.name === 'Calculadora' ||
          link.name === 'Registro'
      );
  }


  // --- RENDERIZADO ---
  return (
    <>
      {/* =========================================
          1. BARRA DE NAVEGACIÓN MÓVIL INFERIOR (ULTRA PREMIUM)
          ========================================= */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 shadow-xl sm:hidden">
        {/* Mantenemos justify-around para distribuir uniformemente los 3 o 4 elementos */}
        <div className="flex justify-around items-center h-full max-w-lg mx-auto">
          
          {/* Enlaces móviles (Inicio, Calculadora, y Registro si no está logueado) */}
          {mobileLinks.map((link) => (
            <MobileNavLink key={link.name} link={link} />
          ))}

          {/* Botón de Acceso/Panel (El botón dinámico, MANTENIDO) */}
          <Link
            href={status === "authenticated" ? "/dashboard" : "/login"}
            className="group flex flex-col items-center p-1.5 transition-colors text-red-600"
          >
            {status === "authenticated" ? (
                <>
                    <ComputerDesktopIconSolid className="w-6 h-6 shrink-0 text-red-600" />
                    <span className="text-[10px] font-semibold mt-0.5 text-red-700">Panel</span>
                </>
            ) : (
                <>
                    <ArrowRightEndOnRectangleIcon className="w-6 h-6 shrink-0 text-slate-600 group-hover:text-red-600" />
                    <span className="text-[10px] font-semibold mt-0.5 text-slate-600 group-hover:text-red-700">Acceso</span>
                </>
            )}
          </Link>
          
        </div>
      </nav>

      {/* =========================================
          2. BARRA DE NAVEGACIÓN DESKTOP (Horizontal, Fija)
          ========================================= */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all hidden sm:block">
        <div className="container mx-auto px-4">
          
          <div className="flex items-center justify-center h-16 md:h-20 gap-2 overflow-x-auto no-scrollbar">
            
            {allLinks.map((link) => {
              // 🚨 FIX DESKTOP: Ocultamos Registro si está logueado
              if (link.name === 'Registro' && status === "authenticated") {
                return null;
              }
              
              const isActive = pathname === link.href;
              const IconComponent = isActive ? link.activeIcon : link.icon;
              
              // Aplicación de estilos de Desktop
              const linkClasses = `${desktopLinkBase} ${isActive ? `${ACTIVE_COLOR} bg-red-50 font-bold` : `${INACTIVE_COLOR} hover:bg-red-50 hover:text-red-600`}`;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={linkClasses}
                >
                  <IconComponent className={desktopIconBase} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Botón dinámico (Panel/Acceso) Desktop */}
            {status === "authenticated" ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#E33127] text-white text-sm font-bold shadow-md shadow-red-200 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap ml-2"
              >
                <ComputerDesktopIconSolid className="w-5 h-5 shrink-0" />
                <span>Panel</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#E33127] text-white text-sm font-bold shadow-md shadow-red-200 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap ml-2"
              >
                <ArrowRightEndOnRectangleIcon className="w-5 h-5 shrink-0" />
                <span>Acceso</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Espacio para evitar que el contenido se esconda detrás de la barra inferior */}
      <div className="sm:hidden h-16 w-full"></div>
    </>
  );
}