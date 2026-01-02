// src/app/ui/header.tsx (FECHA EN NEGRITA - DISEÑO FINAL)

"use client";

import Link from "next/link";
import Image from "next/image"; 
import { partsOfTheDay, currentDate } from "../common"; 
import React from "react";

export default function Header() {
  const saludo = partsOfTheDay();
  const fecha = currentDate();

  // Colores Premium
  const TEXT_DARK = 'text-slate-900'; // Color oscuro para textos principales
  const TEXT_GRAY = 'text-slate-600'; // Gris un poco más oscuro para que la negrita se note bien
  const BRAND_HOVER = 'text-[#E33127]';

  return (
    <header className="w-full bg-white relative font-sans z-40">
      
      <div className="container mx-auto px-4 py-4 md:py-5 md:px-8 max-w-7xl">
        
        {/* Alineación Horizontal Perfecta */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
          
          {/* ================= IZQUIERDA: DISEÑO LINEAL (Intacto) ================= */}
          <Link 
            href="/" 
            className="flex items-center gap-4 group md:w-auto justify-center md:justify-start"
          >
            
            {/* 1. LOGO */}
            <div className="relative h-14 w-14 md:h-16 md:w-16 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
               <Image 
                 src="/motostore-logo.png" 
                 alt="Moto Store LLC" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>

            {/* 2. TEXTO EN LÍNEA */}
            <div className="flex items-center text-center md:text-left leading-none">
              
              {/* NOMBRE */}
              <span className={`font-black text-xl md:text-2xl ${TEXT_DARK} group-hover:${BRAND_HOVER} transition-colors tracking-tight`}>
                Moto Store LLC
              </span>
              
              {/* SEPARADOR VERTICAL */}
              <div className="h-6 w-px bg-gray-300 mx-3 hidden sm:block"></div>

              {/* SLOGAN */}
              <span className={`hidden sm:inline text-sm md:text-base text-slate-500 font-medium tracking-wide`}>
                Soluciones Digitales 24/7
              </span>
            </div>
          
          </Link>


          {/* ================= DERECHA: WIDGET (FECHA EN NEGRITA) ================= */}
          <div className="hidden lg:flex items-center">
            
            {/* Cápsula elegante sin icono */}
            <div className="flex items-center justify-center bg-gray-50 px-6 py-2 rounded-full border border-gray-100 transition-shadow hover:shadow-sm">
              
              <div className="text-right flex flex-col">
                
                {/* SALUDO (Negrita) */}
                <span className={`text-sm font-bold ${TEXT_DARK} leading-none`}>
                  {saludo}
                </span>
                
                {/* FECHA (AHORA EN NEGRITA TAMBIÉN) 
                    - Cambié font-semibold por font-bold.
                    - Usé TEXT_GRAY (slate-600) para que se lea nítido.
                */}
                <span className={`text-[11px] font-bold ${TEXT_GRAY} uppercase tracking-wide mt-0.5`}>
                  {fecha}
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
      
    </header>
  );
}






































































































