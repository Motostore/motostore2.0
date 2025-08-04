'use client';

import Link from "next/link";
import MotostoreLogo from "./motostore-logo";  
import { partsOfTheDay, currentDate } from "../common"; 
import HeaderProfile from "./dashboard/header-profile";
import Head from "next/head"; 

export default function Header() {
  const saludo = partsOfTheDay();  
  const fecha = currentDate();    

  return (
    <div className="w-full md:px-16 md:h-100">
      <Head>
        <title>Moto Store LLC | Soluciones Digitales 24/7</title>
      </Head>

      <div className='flex sm:flex-row flex-col justify-between items-center w-full'>
        {/* LOGO + TEXTO + VERIFICADO */}
        <Link href="/" className="flex items-center justify-start px-4">
          <div className="p-4 flex items-center gap-2">
            <MotostoreLogo className="w-5 h-5" /> {/* Logo más pequeño */}
            <div className="flex items-center gap-1 text-sm md:text-base font-semibold text-gray-800">
              <span>Moto Store LLC</span>
              <span className="font-light text-gray-500">| Soluciones Digitales 24/7</span>
              <img
                src="/meta_verified_icon.png"
                alt="Meta verificado"
                className="w-3 h-3 mt-0.5"
              />
            </div>
          </div>
        </Link>

        {/* PERFIL + FECHA */}
        <div className='flex flex-col items-center px-4'>
          <HeaderProfile />
          <div className="text-sm md:text-base text-black font-semibold mt-2 text-right">
            {saludo}<br />
            {fecha}
          </div>
        </div>
      </div>

      {/* BARRA INFORMATIVA */}
      <div className="overflow-hidden bg-transparent py-2">
        <div className="whitespace-nowrap animate-marquee text-center text-black font-medium">
          🚀 Muy pronto: ¡Bienvenido a Moto Store LLC 2.0! Renovamos nuestra plataforma para ofrecerte soluciones digitales más rápidas, seguras y automatizadas.
        </div>
      </div>
    </div>
  );
}

























































































