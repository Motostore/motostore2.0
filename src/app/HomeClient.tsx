"use client";

import Image from "next/image"; 
import { useState, useEffect } from "react";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

// Componentes UI
import Footer from "./ui/footer"; 
import HomeTutorial from "./ui/common/home-tutorial"; 
import MarqueeBar from "./ui/common/MarqueeBar"; 
import NavigationHome from "./ui/common/NavigationHome"; 
import Header from "./ui/header";

// Mensajes
import { ANUNCIO_BARRA } from "./mensajes";

// 📖 LISTA DE VERSÍCULOS (Aleatorios)
const VERSICULOS = [
  "Todo lo puedo en Cristo que me fortalece. (Filipenses 4:13)",
  "Jehová es mi pastor; nada me faltará. (Salmos 23:1)",
  "Esfuérzate y sé valiente; no temas ni desmayes. (Josué 1:9)",
  "Porque yo sé los planes que tengo para vosotros... planes de bienestar. (Jeremías 29:11)",
  "El amor es paciente, es bondadoso. (1 Corintios 13:4)",
  "Encomienda a Jehová tus obras, y tus pensamientos serán afirmados. (Proverbios 16:3)",
  "Lámpara es a mis pies tu palabra, y lumbrera a mi camino. (Salmos 119:105)",
  "Mas a Dios gracias, el cual nos lleva siempre en triunfo en Cristo Jesús. (2 Corintios 2:14)",
  "Si Dios es por nosotros, ¿quién contra nosotros? (Romanos 8:31)",
  "Buscad primeramente el reino de Dios y su justicia. (Mateo 6:33)"
];

export default function HomeClient() {
  const images = [
    "/assets/banner/Mesadetrabajo1@72x-01.png",
    "/assets/banner/Mesadetrabajo1@72x-02.png",
    "/assets/banner/Mesadetrabajo1@72x-03.png",
    "/assets/banner/Mesadetrabajo1@72x-05.png",
    "/assets/banner/Mesadetrabajo1@72x-04.png",
    "/assets/banner/Mesadetrabajo1@72x-06.png",
    "/assets/banner/Mesadetrabajo1@72x-07.png",
  ];

  // Estado para hidratación y texto dinámico
  const [mounted, setMounted] = useState(false);
  const [displayText, setDisplayText] = useState(ANUNCIO_BARRA); 

  useEffect(() => { 
    setMounted(true); 
    
    // 🎲 Lógica: Elige un versículo al azar cada vez que se carga la página
    const randomVerse = VERSICULOS[Math.floor(Math.random() * VERSICULOS.length)];
    
    // Combina el anuncio original + el versículo
    setDisplayText(`${ANUNCIO_BARRA}   ✦   📖 ${randomVerse}`);
  }, []);
  
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white font-sans text-slate-800 flex flex-col overflow-x-hidden">
      
      {/* 1. HEADER SUPERIOR */}
      <Header />

      {/* 2. BARRA DE ANUNCIOS (CON VERSÍCULO) */}
      <div className="w-full my-1 border-none outline-none z-40 relative">
        <MarqueeBar 
          text={displayText} 
          styleType="minimal"
        />
      </div>

      {/* 3. NAVEGACIÓN */}
      <NavigationHome />

      {/* 4. SLIDER PRINCIPAL (AJUSTADO AL 100%) */}
      <section className="w-full bg-white pt-4 pb-2">
        <div className="slide-container w-full max-w-[1920px] mx-auto px-0 md:px-0">
          {/* CORRECCIÓN: Se eliminó la propiedad 'scale' que causaba el error en Fade */}
          <Fade 
            duration={5000} 
            transitionDuration={800} 
            infinite 
            indicators={(index) => <div className="indicator mt-4"></div>}
            arrows={false} 
          >
            {images.map((src, index) => (
              <div className="each-slide-effect w-full" key={index}>
                {/* 🔥 FIX: Altura automática para que no se corte el banner */}
                <div className="flex justify-center items-center w-full !h-auto !bg-none !shadow-none p-0 m-0 border-none rounded-none">
                   <Image 
                     src={src} 
                     alt={`Banner Moto Store ${index + 1}`}
                     width={1920} 
                     height={650}
                     className="w-full h-auto object-contain md:object-cover"
                     priority={index === 0}
                     unoptimized
                   />
                </div>
              </div>
            ))}
          </Fade>
        </div>
      </section>

      {/* 5. SECCIÓN DE CARACTERÍSTICAS */}
      <section className="bg-white py-16 lg:py-24 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              La plataforma todo en uno para tu <span className="text-red-600">Negocio Digital</span>
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              En Moto Store LLC centralizamos recargas y servicios digitales para que operes sin límites geográficos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 group-hover:text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
               </div>
               <h4 className="font-bold text-slate-900 text-xl mb-3 group-hover:text-red-600 transition-colors">Procesamiento Rápido</h4>
               <p className="text-gray-600 leading-relaxed">
                 Ejecución automatizada al instante. Tus recargas y licencias se procesan en segundos, sin esperas innecesarias.
               </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 group-hover:text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
               </div>
               <h4 className="font-bold text-slate-900 text-xl mb-3 group-hover:text-red-600 transition-colors">100% Seguro</h4>
               <p className="text-gray-600 leading-relaxed">
                 Infraestructura blindada. Protegemos cada transacción con encriptación de grado bancario para tu total tranquilidad.
               </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 group-hover:text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
               </div>
               <h4 className="font-bold text-slate-900 text-xl mb-3 group-hover:text-red-600 transition-colors">Sin Fronteras</h4>
               <p className="text-gray-600 leading-relaxed">
                 Conectividad global. Operamos fluidamente en Venezuela, Colombia, Ecuador, Perú, Chile y el resto de Latinoamérica.
               </p>
            </div>

          </div>
        </div>
      </section>

      <div className="bg-white"> 
        <HomeTutorial />
      </div>

      <Footer />
    </main>
  );
}