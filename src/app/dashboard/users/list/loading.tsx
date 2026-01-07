'use client';

import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-slate-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        
        {/* Logo de MotoStore con animación de pulso */}
        <div className="relative w-24 h-24 mb-6 animate-pulse">
          <Image
            src="/motostore-logo.png" // Asegúrate de que tu logo esté aquí en la carpeta public
            alt="Cargando Moto Store..."
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Spinner sutil en el color de la marca */}
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#E33127] rounded-full animate-spin"></div>
        
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Cargando sistema...
        </p>
      </div>
    </div>
  );
}