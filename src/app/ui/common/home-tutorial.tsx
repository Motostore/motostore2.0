import React from 'react';

export default function HomeTutorial() {
  
  // Componente de Tarjeta
  const FeatureCard = ({ image, title, description }: { image: string, title: string, description: string }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default flex flex-col items-center text-center">
      
      {/* IMAGEN FLOTANTE */}
      <div className="h-20 w-20 mb-6 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>
      
      {/* Título */}
      <h4 className="font-black text-lg uppercase tracking-tight mb-3 text-slate-900 group-hover:text-[#E33127] transition-colors">
        {title}
      </h4>
      
      {/* Descripción */}
      <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xs">
        {description}
      </p>
    </div>
  );

  return (
    <div className='py-16 bg-white border-t border-slate-100'>
      <div className='container mx-auto px-4 lg:px-16'>
        
        {/* Título */}
        <div className="text-center mb-16">
          <span className="text-[#E33127] font-black uppercase tracking-widest text-xs mb-2 block">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-slate-900 uppercase text-center text-3xl md:text-4xl font-black tracking-tight">
            Nuestras Ventajas
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* 1. CALCULADORA (✅ IMAGEN LOCAL) */}
          <FeatureCard 
            image="/calculadora-paypal.png" 
            title="Calculadora PayPal"
            description="Herramienta exclusiva para calcular comisiones exactas antes de enviar o recibir saldo."
          />

          {/* 2. RESPALDO LEGAL */}
          <FeatureCard 
            image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Classical%20Building.png"
            title="Empresa Tri-Nacional"
            description="Operamos legalmente registrados en USA, Colombia y Venezuela. 100% seguro."
          />

          {/* 3. MULTI-MONEDA (✅ CAMBIADO A TARJETA CRÉDITO 3D - CARGA SEGURO) */}
          <FeatureCard 
            image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Credit%20Card.png"
            title="Pagos Flexibles"
            description="Recibimos y enviamos en tu moneda local: Bolívares, Pesos, Zelle y USDT."
          />

          {/* 4. SOPORTE HUMANO (✅ CAMBIADO A TECNÓLOGO 3D - CARGA SEGURO) */}
          <FeatureCard 
            image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
            title="Soporte Humano"
            description="Nada de bots. Atención personalizada vía WhatsApp con agentes reales."
          />

          {/* 5. GARANTÍA */}
          <FeatureCard 
            image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png"
            title="Garantía de Servicio"
            description="En Streaming y Licencias, ofrecemos reposición o te devolvemos el dinero."
          />

          {/* 6. VELOCIDAD */}
          <FeatureCard 
            image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Stopwatch.png"
            title="Entrega Inmediata"
            description="Sistemas optimizados para procesar y entregar en minutos. Respetamos tu tiempo."
          />

        </div>
      </div>
    </div>
  );
}