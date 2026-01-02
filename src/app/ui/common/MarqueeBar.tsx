// src/app/ui/common/MarqueeBar.tsx (SIN BORDES - DISEÑO LIMPIO)

"use client";

import React from "react";

interface MarqueeBarProps {
  text: string;
  styleType?: "default" | "minimal";
}

export default function MarqueeBar({ text, styleType = "default" }: MarqueeBarProps) {
  return (
    // 🔥 CAMBIO PRO: 
    // 1. 'bg-white': Fondo blanco para fusionarse con el resto.
    // 2. Eliminamos cualquier 'border', 'border-b' o 'shadow'.
    // 3. 'overflow-hidden': Para asegurar que la animación no rompa el diseño.
    <div className="w-full bg-white relative overflow-hidden py-2">
      
      {/* Contenedor del texto con animación suave */}
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap py-1">
          {/* Texto con estilo profesional y color gris oscuro (slate-700) para buen contraste */}
          <span className="text-sm md:text-base font-semibold text-slate-700 mx-4">
            {text}
          </span>
          {/* Repetimos el texto para el efecto infinito si es necesario, 
              o simplemente dejamos el span principal si tu animación CSS ya lo maneja. */}
        </div>
      </div>

    </div>
  );
}