// src/app/ui/common/tutorial.tsx (CÓDIGO CORREGIDO PARA TYPESCRIPT)

import React from 'react';
// IMPORTACIÓN DE ICONOS HEROICONS
import { CreditCardIcon, CursorArrowRaysIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function Tutorial() {
  
  // Definición del tamaño del icono SVG
  const iconSvgClass = "w-10 h-10"; // Ícono ligeramente más grande para impacto visual

  // Componente interno para las tarjetas
  // CORRECCIÓN: Cambiamos 'string | JSX.Element' por 'React.ReactNode'
  const ServiceCard = ({ icon: Icon, title, description, iconColor, ringColor, baseColor }: { 
    icon: React.ElementType, 
    title: string, 
    description: React.ReactNode, // Esto acepta texto, HTML, JSX, etc.
    iconColor: string,      
    baseColor: string,      
    ringColor: string       
  }) => (
    // Estilo PRO: Tarjeta limpia con elevación en hover y efecto de anillo vibrante
    <div className={`bg-white p-6 rounded-xl border border-gray-100 shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col items-center text-center ${ringColor} hover:shadow-xl hover:-translate-y-1`}>
      
      {/* 1. Contenedor del ÍCONO (Círculo Doble) */}
      <div className={`h-20 w-20 ${baseColor} rounded-full flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105 shadow-md`}>
        {/* Círculo interior blanco */}
        <div className={`h-16 w-16 bg-white rounded-full flex items-center justify-center text-white`}>
            {/* El ícono utiliza el color definido en iconColor */}
            <Icon className={`${iconSvgClass} ${iconColor}`} />
        </div>
      </div>
      
      {/* 2. Título */}
      <h4 className="font-extrabold text-lg mb-2 text-slate-900 transition-colors group-hover:text-red-600">
        {title}
      </h4>
      
      {/* 3. Descripción */}
      <div className="text-gray-500 text-sm leading-relaxed flex-grow">
        {description}
      </div>
    </div>
  );

  return (
    <div className='py-8'>
      <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
         Proceso de Activación Rápida
      </h3>
      <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Registro Rápido (Azul) */}
        <ServiceCard 
          icon={PencilSquareIcon}
          title="Registro Rápido"
          description="Crea tu cuenta en segundos para acceder al panel de usuario. La activación es inmediata, sin esperas ni verificaciones manuales complejas."
          iconColor="text-blue-600"
          baseColor="bg-blue-100"
          ringColor="hover:ring-4 hover:ring-blue-600/20"
        />

        {/* 2. Selección y Destino (Verde) */}
        <ServiceCard 
          icon={CursorArrowRaysIcon}
          title="Selección y Destino"
          description={
            <>
              Elige el servicio (Recargas, Licencias, etc.) e indica el destino: 
              <strong className="font-semibold"> Venezuela, Colombia, Ecuador, Perú o Chile.</strong>
            </>
          }
          iconColor="text-green-500"
          baseColor="bg-green-100"
          ringColor="hover:ring-4 hover:ring-green-500/20"
        />

        {/* 3. Confirmación y Pago (Celeste) */}
        <ServiceCard 
          icon={CreditCardIcon}
          title="Confirmación y Pago"
          description="Utiliza nuestro sistema de pago seguro. Aceptamos pagos móviles, Binance, Zelle, y tarjetas de crédito/débito internacionales."
          iconColor="text-sky-500"
          baseColor="bg-sky-100"
          ringColor="hover:ring-4 hover:ring-sky-500/20"
        />

      </div>
    </div>
  );
}