// src/app/QuienesSomos/page.tsx (EDICIÓN PRO ORO +++ / SEO INTACTO)

import Image from 'next/image';
import type { Metadata } from 'next';

// 1. IMPORTAMOS EL ECOSISTEMA DE DISEÑO DEL HOME
import Header from "../ui/header";
import MarqueeBar from "../ui/common/MarqueeBar";
import NavigationHome from "../ui/common/NavigationHome";
import Footer from "../ui/footer";
// Importamos el mensaje centralizado para que si lo cambias, cambie aquí también
import { ANUNCIO_BARRA } from "../mensajes"; 

// 🔹 SEO ULTRA PRO: Mantenemos tu configuración intacta
export const metadata: Metadata = {
  title: {
    absolute: 'Quiénes somos | Moto Store LLC',
  },
  description:
    'Conoce a Moto Store LLC, nuestro compromiso, misión y visión en soluciones digitales 24/7.',
  alternates: {
    canonical: 'https://motostorellc.com/quienes-somos',
  },
  openGraph: {
    title: 'Quiénes somos en Moto Store LLC',
    description:
      'Descubre la misión y visión que impulsa nuestro compromiso con las soluciones digitales.',
    url: 'https://motostorellc.com/quienes-somos',
    siteName: 'Moto Store LLC',
    type: 'website',
    images: [
      {
        url: 'https://motostorellc.com/og/about-us-motostore.png', 
        width: 1200,
        height: 630,
        alt: 'Quiénes somos en Moto Store LLC',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Quiénes somos | Moto Store LLC',
    description: 'Nuestro compromiso con el éxito digital de tu negocio.',
  },
};

export default function AboutPage() {
  const BRAND_RED = 'text-[#E33127]';
  
  // 🔥 CAMBIO CLAVE: Quitamos 'min-h-screen bg-gray-50' y usamos 'bg-white'
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* ==================== 1. ZONA SUPERIOR (NIVEL PRO ORO) ==================== */}
      <Header />
      
      {/* Barra de Anuncios con el estilo limpio 'my-1' */}
      <div className="w-full my-1 border-none outline-none z-40 relative">
        <MarqueeBar text={ANUNCIO_BARRA} styleType="minimal" />
      </div>
      
      <NavigationHome />


      {/* ==================== 2. CONTENIDO PRINCIPAL (CLEAN CANVAS) ==================== */}
      {/* Ya no usamos la tarjeta blanca sobre fondo gris. Ahora el contenido flota en blanco puro. */}
      
      <div className="relative overflow-hidden">
        
        {/* Decoración de fondo sutil (Coherencia con Home) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-16 max-w-6xl relative z-10">
          
          {/* TÍTULO PRINCIPAL */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Nuestra Historia y <span className={BRAND_RED}>Compromiso</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              El motor que impulsa tus soluciones digitales con pasión y tecnología.
            </p>
          </div>

          <div className="space-y-24">
            
            {/* --- SECCIÓN 1: QUIÉNES SOMOS --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="md:order-1">
                <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${BRAND_RED}`}>
                  <span className="w-10 h-1 bg-[#E33127] rounded-full"></span>
                  Quiénes somos
                </h2>
                
                <p className="text-xl leading-relaxed text-slate-600 mb-6 text-justify">
                  En <span className={`font-bold ${BRAND_RED}`}>Moto Store LLC</span>, somos un equipo comprometido y apasionado por ayudar a nuestros
                  clientes a alcanzar su máximo potencial. Ofrecemos soluciones
                  innovadoras y de alta calidad en plataformas digitales, siempre con
                  dedicación y excelencia.
                </p>

                {/* NOTA DEL NOMBRE (Diseño destacado) */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8 transition-shadow hover:shadow-md">
                  <p className="text-base text-slate-600 italic text-justify">
                    <span className="font-bold text-[#E33127] not-italic not-sr-only">Nota curiosa: </span>
                    El nombre <span className="font-semibold text-slate-800">Moto Store LLC</span> no proviene de la venta de motos. “Moto” es un apodo personal
                    inspirado en el personaje Moto Moto de la película Madagascar, y fue
                    adoptado con cariño por quienes me conocen. Representa cercanía, originalidad y autenticidad.
                  </p>
                </div>
              </div>

              {/* Imagen / Ilustración */}
              <div className="md:order-2 flex justify-center text-center">
                 {/* Usamos tu imagen SVG original */}
                 <Image
                    width={450}
                    height={450}
                    alt="Ilustración sobre quiénes somos"
                    src="/illustrations/about.svg"
                    priority
                    className="drop-shadow-lg transition-transform hover:scale-105 duration-500"
                  />
              </div>
            </section>


            {/* --- SECCIÓN 2: MISIÓN --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="md:order-1 flex justify-center text-center">
                  <Image
                    width={450}
                    height={450}
                    alt="Ilustración sobre la misión"
                    src="/illustrations/mision.svg"
                    className="drop-shadow-lg transition-transform hover:scale-105 duration-500"
                  />
              </div>

              <div className="md:order-2">
                <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${BRAND_RED}`}>
                  <span className="w-10 h-1 bg-[#E33127] rounded-full"></span>
                  Misión
                </h2>
                <p className="text-xl leading-relaxed text-slate-600 mb-6 text-justify">
                  En <span className={`font-bold ${BRAND_RED}`}>Moto Store LLC</span>, nuestra misión es brindar soluciones digitales de alta calidad que
                  resuelvan las necesidades de nuestros clientes de manera eficaz y
                  personalizada. Nos comprometemos a proporcionar productos innovadores
                  y un servicio de excelencia que impulse el crecimiento y el éxito de
                  cada uno de nuestros clientes.
                </p>
                <p className="text-xl leading-relaxed text-slate-600 text-justify">
                  Nuestra prioridad es ofrecer un acompañamiento cercano y asesoría
                  profesional, asegurando que cada cliente logre su máximo potencial.
                </p>
              </div>
            </section>


            {/* --- SECCIÓN 3: VISIÓN --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="md:order-1">
                <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${BRAND_RED}`}>
                   <span className="w-10 h-1 bg-[#E33127] rounded-full"></span>
                   Visión
                </h2>
                <p className="text-xl leading-relaxed text-slate-600 mb-6 text-justify">
                  Nuestra visión es convertirnos en un referente global en el mercado
                  de soluciones digitales, destacándonos no solo por nuestra
                  innovación, sino también por el compromiso genuino con nuestros
                  clientes.
                </p>
                <p className="text-xl leading-relaxed text-slate-600 text-justify">
                  En <span className={`font-bold ${BRAND_RED}`}>Moto Store LLC</span>, trabajamos incansablemente para ofrecer soluciones digitales
                  rápidas, eficientes y personalizadas, siempre superando las
                  expectativas con integridad.
                </p>
              </div>

              <div className="md:order-2 flex justify-center text-center">
                  <Image
                    width={450}
                    height={450}
                    alt="Ilustración sobre la visión"
                    src="/illustrations/vision.svg"
                    className="drop-shadow-lg transition-transform hover:scale-105 duration-500"
                  />
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* FOOTER INTEGRADO */}
      <Footer />
    </main>
  );
}


















































