import React from 'react';
// IMPORTACIÓN DE ICONOS HEROICONS
import {
  DevicePhoneMobileIcon, // Recargas
  KeyIcon, // Licencias Digitales
  PencilSquareIcon, // Panel de Usuario
  MegaphoneIcon, // Marketing Digital
  ShieldCheckIcon, // Métodos Flexibles
  RssIcon // ICONO PARA STARLINK (Señal de Antena/Broadcast)
} from "@heroicons/react/24/outline";

export default function HomeTutorial() {
  
  // Definición del tamaño del icono SVG
  const iconSvgClass = "w-8 h-8";

  // Componente interno para las tarjetas
  const ServiceCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
      
      {/* ICONO (SVG COMPONENT) */}
      <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 mx-auto shadow-inner">
        <Icon className={iconSvgClass} /> {/* Usamos el componente SVG */}
      </div>
      
      {/* Título (Rojo al pasar el mouse) */}
      <h4 className="text-center font-bold text-xl mb-3 text-slate-900 group-hover:text-red-600 transition-colors">
        {title}
      </h4>
      
      {/* Descripción */}
      <p className="text-center text-gray-500 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );

  return (
    <div className='p-4 md:p-10 bg-gray-50'>
      <div className='container mx-auto px-2 lg:px-16 my-4'>
        
        {/* Título de la Sección con Decoración */}
        <div className="text-center mb-12">
          <h2 className="text-gray-900 uppercase text-center text-2xl md:text-3xl font-extrabold tracking-tight">
            Nuestras Soluciones
          </h2>
          {/* Pequeña línea roja decorativa debajo del título */}
          <div className="h-1 w-20 bg-red-600 rounded-full mx-auto mt-3 opacity-80"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Starlink (Icono: Antena/Señal de Transmisión) */}
          <ServiceCard 
            icon={RssIcon}
            title="Starlink"
            description="Gestiona y paga tu servicio de internet satelital Starlink de forma fácil, asegurando tu conexión de alta velocidad sin interrupciones."
          />

          {/* 2. Recargas (Teléfono Móvil) */}
          <ServiceCard 
            icon={DevicePhoneMobileIcon}
            title="Recargas"
            description="Saldo al instante para operadoras internacionales (Movistar, Digitel, Claro, Tigo). Conexión inmediata para ti o tus clientes."
          />

          {/* 3. Licencias Digitales (Llave/Acceso) */}
          <ServiceCard 
            icon={KeyIcon}
            title="Licencias Digitales"
            description="Software y licencias originales activadas al momento. Soluciones legales y seguras para potenciar tu negocio o emprendimiento."
          />

          {/* 4. Panel de Usuario (Lápiz/Control) */}
          <ServiceCard 
            icon={PencilSquareIcon}
            title="Panel de Usuario"
            description="Accede a un panel intuitivo para gestionar tus compras, ver historial y controlar tus servicios digitales en un solo lugar."
          />

          {/* 5. Marketing Digital (Megáfono) */}
          <ServiceCard 
            icon={MegaphoneIcon}
            title="Marketing Digital"
            description="Estrategias de crecimiento real: Gestión de Ads, Branding y posicionamiento SEO para llevar tu marca al siguiente nivel."
          />

          {/* 6. Métodos Flexibles (Escudo/Seguridad) */}
          <ServiceCard 
            icon={ShieldCheckIcon}
            title="Métodos Flexibles"
            description="Aceptamos múltiples formas de pago adaptadas a tu país: Transferencias, Pago Móvil, Binance, Zelle y Tarjetas Internacionales."
          />

        </div>
      </div>
    </div>
  );
}