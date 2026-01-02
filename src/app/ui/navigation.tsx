// src/app/ui/common/NavigationHome.tsx (VERSIÓN COMPACTA Y AJUSTADA)
"use client";

import Link from "next/link";
import { 
  HomeIcon, 
  UserCircleIcon, 
  QuestionMarkCircleIcon,
  CalculatorIcon,
  UserPlusIcon,
  ArrowRightEndOnRectangleIcon 
} from "@heroicons/react/24/outline";

export default function NavigationHome() {
  // Estilo unificado: whitespace-nowrap evita que el texto se parta en dos líneas
  const linkStyle = "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group whitespace-nowrap";
  const iconStyle = "w-5 h-5 group-hover:scale-110 transition-transform";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="container mx-auto px-4">
        {/* USAMOS 'justify-center' EN LUGAR DE 'justify-between' PARA JUNTAR TODO */}
        <div className="flex items-center justify-center h-16 md:h-20 gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          
          {/* GRUPO 1: ENLACES */}
          <div className="flex items-center gap-1">
            <Link href="/" className={linkStyle}>
              <HomeIcon className={iconStyle} /> 
              <span>Inicio</span>
            </Link>
            <Link href="/QuienesSomos" className={linkStyle}>
              <UserCircleIcon className={iconStyle} /> 
              <span>Quiénes somos</span>
            </Link>
            <Link href="/ayuda" className={linkStyle}>
              <QuestionMarkCircleIcon className={iconStyle} /> 
              <span>Cómo funciona</span>
            </Link>
            {/* Aquí forzamos el ancho mínimo si es necesario, pero whitespace-nowrap debería bastar */}
            <Link href="/calculadorapaypal" className={linkStyle}>
              <CalculatorIcon className={iconStyle} /> 
              <span>Calculadora PayPal</span>
            </Link>
          </div>

          {/* LÍNEA SEPARADORA SUTIL (Opcional, ayuda visualmente) */}
          <div className="h-6 w-px bg-slate-200 hidden md:block mx-2"></div>

          {/* GRUPO 2: BOTONES (Ahora están justo al lado) */}
          <div className="flex items-center gap-2">
            
            <Link href="/Registro" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap">
              <UserPlusIcon className="w-5 h-5" />
              <span>Registro</span>
            </Link>

            <Link href="/login" className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#E33127] text-white text-sm font-bold shadow-md shadow-red-200 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
              <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
              <span>Acceso</span>
            </Link>

          </div>

        </div>
      </div>
    </nav>
  );
}