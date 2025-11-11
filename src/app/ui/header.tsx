// src/app/ui/header.tsx
'use client';

import Link from "next/link";
import MotostoreLogo from "./motostore-logo";
import { partsOfTheDay, currentDate } from "../common";
import HeaderProfile from "./dashboard/header-profile";

export default function Header() {
  const saludo = partsOfTheDay();
  const fecha = currentDate();

  return (
    <div className="w-full md:px-16 md:h-100">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full">
        {/* Logo + Nombre + Eslogan fijo */}
        <Link href="/" className="flex items-center justify-start px-4 w-full sm:w-auto">
          <div className="p-4 flex items-center gap-3">
            <MotostoreLogo className="w-6 h-6 sm:w-7 sm:h-7" />
            <div className="flex items-center flex-wrap gap-x-2 text-sm sm:text-base">
              <span className="font-semibold text-gray-900">Moto Store LLC</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Soluciones Digitales 24/7</span>
            </div>
          </div>
        </Link>

        {/* Perfil + saludo/fecha */}
        <div className="flex flex-col items-center px-4 pb-2 sm:pb-0">
          <HeaderProfile />
          <div className="text-sm md:text-base text-black font-semibold mt-2 text-right">
            {saludo}<br />
            {fecha}
          </div>
        </div>
      </div>

      {/* Marquee informativo (igual que antes) */}
      <div className="overflow-hidden bg-transparent py-2">
        <div className="whitespace-nowrap animate-marquee text-center text-black font-medium">
          🚀 ¡Bienvenido a Moto Store LLC 2.2! Renovamos nuestra plataforma para ofrecerte soluciones digitales más rápidas, seguras y automatizadas.
        </div>
      </div>
    </div>
  );
}



































































































