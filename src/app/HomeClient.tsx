"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

// Componentes
import Header from "./ui/header";
import NavigationHome from "./ui/common/NavigationHome";
import MarqueeBar from "./ui/common/MarqueeBar";
import HomeTutorial from "./ui/common/home-tutorial"; 
import Footer from "./ui/footer";
import { ANUNCIO_BARRA } from "./mensajes";

const VERSICULOS = [
  "Todo lo puedo en Cristo que me fortalece. (Filipenses 4:13)",
  "Jehová es mi pastor; nada me faltará. (Salmos 23:1)",
  "Esfuérzate y sé valiente; no temas ni desmayes. (Josué 1:9)",
  "Jeremías 29:11 - Porque yo sé los planes que tengo para vosotros...",
  "Encomienda a Jehová tus obras, y tus pensamientos serán afirmados. (Proverbios 16:3)"
];

export default function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const [displayText, setDisplayText] = useState(ANUNCIO_BARRA); 

  // Banners locales
  const images = [
    "/assets/banner/Mesadetrabajo1@72x-01.png",
    "/assets/banner/Mesadetrabajo1@72x-02.png",
    "/assets/banner/Mesadetrabajo1@72x-03.png",
    "/assets/banner/Mesadetrabajo1@72x-05.png",
    "/assets/banner/Mesadetrabajo1@72x-04.png",
    "/assets/banner/Mesadetrabajo1@72x-06.png",
    "/assets/banner/Mesadetrabajo1@72x-07.png",
  ];

  // 🔥 1. SERVICIOS CORREGIDOS
  const services = [
    {
      title: "Remesas & Zelle",
      desc: "Cambios P2P rápidos y seguros. Tasa competitiva.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20Bag.png",
      border: "hover:border-emerald-200",
      href: "/dashboard/wallet"
    },
    {
      title: "Recargas Globales",
      desc: "Saldo para operadoras en VEN, COL y todo el mundo.",
      // ✅ CORREGIDO: Usamos el icono "Mobile Phone" que es seguro
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png",
      border: "hover:border-blue-200",
      href: "/dashboard/products/recargas"
    },
    {
      title: "Streaming PRO",
      desc: "Netflix, Disney+ y pantallas premium garantizadas.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png",
      border: "hover:border-red-200",
      href: "/dashboard/products/streaming"
    },
    {
      title: "Desarrollo Web",
      desc: "Creamos la página web o app de tus sueños.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png",
      border: "hover:border-slate-300",
      href: "/dashboard/products/development"
    },
    {
      title: "Marketing Digital",
      desc: "Sube de nivel con seguidores y likes reales.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png",
      border: "hover:border-orange-200",
      href: "/dashboard/products/marketing"
    },
    {
      title: "Pago de Servicios",
      desc: "Starlink, Cantv, Corpoelec sin complicaciones.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Receipt.png",
      border: "hover:border-indigo-200",
      href: "/dashboard/products/servicios"
    }
  ];

  // 🔥 2. VENTAJAS
  const ventajas = [
    {
      title: "Transacciones Blindadas",
      desc: "Tecnología de encriptación de punta a punta.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png"
    },
    {
      title: "Sin Fronteras",
      desc: "Operamos en USA, Colombia y Venezuela.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Americas.png"
    },
    {
      title: "Velocidad Rayo",
      desc: "Procesamiento automático en minutos.",
      image: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/High%20Voltage.png"
    }
  ];

  useEffect(() => { 
    setMounted(true); 
    const randomVerse = VERSICULOS[Math.floor(Math.random() * VERSICULOS.length)];
    setDisplayText(`${ANUNCIO_BARRA}   ✦   📖 ${randomVerse}`);
  }, []);
  
  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen bg-slate-50/50 font-sans text-slate-900 overflow-x-hidden">
      
      <Header />
      <div className="z-40 relative shadow-sm bg-white">
        <MarqueeBar text={displayText} styleType="minimal" />
      </div>
      <NavigationHome />

      {/* SLIDER */}
      <section className="w-full bg-slate-50 border-b border-slate-100">
          <div className="w-full max-w-[1920px] mx-auto">
             <Fade duration={5000} transitionDuration={800} infinite arrows={false} indicators={true}>
               {images.map((src, index) => (
                 <div className="w-full flex justify-center" key={index}>
                    <Image
                      src={src}
                      alt={`Banner Moto Store ${index + 1}`}
                      width={1920} 
                      height={600} 
                      className="w-full h-auto object-contain"
                      priority={index === 0}
                      unoptimized 
                    />
                 </div>
               ))}
             </Fade>
          </div>
      </section>

      {/* INTRODUCCIÓN */}
      <section className="pt-12 pb-12 px-4 text-center bg-white">
        <div className="container mx-auto max-w-4xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-[#E33127] text-xs font-black uppercase tracking-widest mb-6">
                🚀 Soluciones Digitales 24/7
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                Tu Plataforma Todo en Uno para <br className="hidden md:block"/>
                <span className="text-[#E33127]">Finanzas & Proyectos</span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium max-w-2xl mx-auto">
                Centralizamos remesas, recargas, streaming y desarrollo web. Rápido, seguro y sin fronteras geográficas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link href="/login" className="px-8 py-4 bg-[#E33127] text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
                   Comenzar Ahora
                </Link>
                <Link href="/calculadorapaypal" className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-xl font-bold hover:border-[#E33127] hover:text-[#E33127] transition-all flex items-center justify-center gap-2">
                   Calculadora
                </Link>
            </div>
        </div>
      </section>

      {/* SECCIÓN DE SERVICIOS */}
      <section className="py-20 px-4 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">Nuestros Servicios</h2>
                <p className="text-slate-500 mt-2">Selecciona una categoría para empezar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv, i) => (
                    <Link 
                        href={srv.href} 
                        key={i} 
                        className={`
                            group bg-white p-8 rounded-2xl border border-transparent 
                            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                            ${srv.border}
                        `}
                    >
                        <div className="flex items-center justify-center mb-6 h-24 w-24 mx-auto">
                            {/* Usamos img estándar para evitar errores de dominios externos en next.config.js */}
                            <img 
                                src={srv.image} 
                                alt={srv.title} 
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
                                loading="lazy"
                            />
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center group-hover:text-[#E33127] transition-colors">
                            {srv.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed text-center">
                            {srv.desc}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* SECCIÓN: ¿POR QUÉ MOTO STORE? */}
      <section className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">¿Por qué Moto Store LLC?</h2>
          </div>

          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 max-w-6xl">
              {ventajas.map((ventaja, i) => (
                 <div className="p-6 flex flex-col items-center group" key={i}>
                    <div className="h-20 w-20 mb-6 transition-transform duration-500 group-hover:-translate-y-2">
                         <img 
                            src={ventaja.image} 
                            alt={ventaja.title} 
                            className="w-full h-full object-contain drop-shadow-md"
                            loading="lazy"
                         />
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-[#E33127] transition-colors">
                        {ventaja.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                        {ventaja.desc}
                    </p>
                 </div>
              ))}
          </div>
      </section>

      <div className="bg-slate-50 pt-10 border-t border-slate-100">
        <HomeTutorial />
      </div>
      <Footer />
      
    </main>
  );
}