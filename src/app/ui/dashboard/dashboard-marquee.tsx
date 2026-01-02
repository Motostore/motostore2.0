"use client";

import MarqueeBar from "../common/MarqueeBar";

export default function DashboardMarquee() {
  // Mensajes del sistema
  const mensaje = "🚀 SISTEMA ACTIVO: Las recargas de Movistar y Digitel están funcionando al 100%  ✦  TASA BCV: Actualizada  ✦  SOPORTE: Activo 24/7 para distribuidores.";
  
  return (
    // CAMBIO: Fondo blanco con borde sutil (Estilo "Minimal")
    <div className="w-full bg-white border-b border-slate-100 py-1 z-40 relative">
      <MarqueeBar 
        text={mensaje} 
        styleType="minimal" // Usamos el mismo estilo limpio del Home
      />
    </div>
  );
}