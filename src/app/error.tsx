// src/app/error.tsx (EDICIÓN FINAL: ULTRA PREMIUM ERROR UI)

'use client';

import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // 1. LIENZO BLANCO (Manteniendo la identidad 'Clean Canvas')
    <div className="flex w-full min-h-[60vh] items-center justify-center bg-white p-4 font-sans relative overflow-hidden">
      
      {/* 2. DECORACIÓN DE FONDO (Destello Rojo Marca) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      {/* 3. TARJETA DE CRISTAL */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-300">
        
        {/* ICONO DE ALERTA (Animado) */}
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-[#E33127] shadow-inner">
            <ExclamationTriangleIcon className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* TÍTULO EN ULTRA NEGRITA */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Algo salió mal
        </h1>
        
        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
          Nuestro sistema ha encontrado un obstáculo inesperado. No te preocupes, esto suele ser temporal.
        </p>

        {/* CAJA TÉCNICA (Discreta y Elegante) */}
        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Detalle del Error:
            </p>
            <code className="block text-xs text-[#E33127] font-mono break-all bg-white px-2 py-1 rounded border border-red-100">
                {error?.message || 'Error desconocido'}
            </code>
            {error?.digest && (
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    Digest Code: {error.digest}
                </p>
            )}
        </div>
        
        {/* BOTÓN GRADIENTE (Estilo Moto Store) */}
        <button
          onClick={() => reset()}
          className="
            group w-full flex items-center justify-center gap-2
            rounded-xl py-3.5
            bg-gradient-to-r from-[#E33127] to-[#C52B22] 
            hover:from-[#C52B22] hover:to-[#A9221A] 
            text-white text-sm font-black tracking-widest uppercase
            shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5
            transition-all duration-300
          "
        >
          <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Intentar de nuevo
        </button>

      </div>
    </div>
  );
}

