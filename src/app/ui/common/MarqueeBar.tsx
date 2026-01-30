"use client";

import React from "react";

interface MarqueeBarProps {
  text: string;
  styleType?: "default" | "minimal";
}

export default function MarqueeBar({ text, styleType = "default" }: MarqueeBarProps) {
  
  // Componente interno para repetir el texto y mantener el código limpio
  const MarqueeItem = () => (
    <div className="flex items-center mx-4">
      <span className="text-sm font-bold text-slate-700 tracking-wide uppercase whitespace-nowrap">
        {text}
      </span>
      {/* Separador sutil (Punto Rojo Moto Store) */}
      <span className="text-[#E33127] mx-6 text-xs">•</span>
    </div>
  );

  return (
    // CAMBIO PRO:
    // 1. 'bg-slate-50': Un gris imperceptible que da estructura sin usar bordes.
    // 2. 'overflow-hidden': Vital para la animación.
    <div className="w-full bg-slate-50 relative overflow-hidden py-3 z-30">
      
      {/* MÁSCARA VISUAL (Opcional): Difumina los bordes izquierdo/derecho para efecto elegante */}
      <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

      {/* CONTENEDOR DE ANIMACIÓN */}
      {/* Usamos 'flex' y duplicamos el contenido para el efecto infinito perfecto */}
      <div className="flex w-max animate-marquee hover:pause">
        <MarqueeItem />
        <MarqueeItem />
        <MarqueeItem />
        <MarqueeItem />
        {/* Repetimos lo suficiente para llenar monitores grandes */}
        <MarqueeItem /> 
        <MarqueeItem />
      </div>

    </div>
  );
}