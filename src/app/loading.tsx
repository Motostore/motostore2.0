// src/app/loading.tsx (EDICIÓN FINAL: ULTRA PREMIUM - TEXTO GRANDE)

import Image from "next/image";

export default function Loading() {
  return (
    // 1. LIENZO BLANCO CON EFECTO CRISTAL
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white font-sans overflow-hidden">
      
      {/* 2. DECORACIÓN DE FONDO (El sello de la casa) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      {/* 3. CONTENEDOR CENTRAL */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* LOGO QUE RESPIRA (Pulse Animation) */}
        <div className="relative w-24 h-24 mb-8 animate-pulse">
          <Image
            src="/motostore-logo.png" 
            alt="Cargando Moto Store..."
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* SPINNER PERSONALIZADO (Minimalista y Rojo) */}
        <div className="relative h-14 w-14 mb-6">
          {/* Anillo base */}
          <div className="absolute inset-0 rounded-full border-[5px] border-slate-100"></div>
          
          {/* Anillo activo (Rojo Marca - Girando) */}
          <div className="absolute inset-0 rounded-full border-[5px] border-t-[#E33127] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        {/* TEXTO DE ESTADO (AHORA GRANDE Y NEGRITA) */}
        {/* 🔥 CAMBIO: text-xl (grande), font-black (ultra negrita), text-slate-700 (oscuro visible) */}
        <p className="text-xl md:text-2xl font-black text-slate-700 tracking-widest uppercase animate-pulse">
          CARGANDO...
        </p>

      </div>
    </div>
  );
}