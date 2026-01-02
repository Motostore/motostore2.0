// src/app/Registro/page.tsx (CÓDIGO DEFINITIVO - NIVEL ULTRA PREMIUM)

import type { Metadata } from "next"; 
import Image from "next/image"; 
import { LocationSelectProvider } from "../Context/locationSelectContext";
import RegisterForm from "./form";

// 1. INTEGRACIÓN CON EL ECOSISTEMA PRO (Header, Menú, Footer)
import Header from "../ui/header";
import NavigationHome from "../ui/common/NavigationHome"; 
import MarqueeBar from "../ui/common/MarqueeBar";         
import Footer from "../ui/footer";
import { ANUNCIO_BARRA } from "../mensajes";              

export const metadata: Metadata = {
  title: {
    absolute: "Registro | Moto Store LLC", 
  },
  description: "Crea tu cuenta de Moto Store LLC y obtén acceso inmediato a todas nuestras herramientas.",
  keywords: ["registro", "crear cuenta", "moto store llc", "servicios digitales"],
  alternates: { canonical: "https://motostorellc.com/registro" },
  openGraph: {
    title: "Únete a Moto Store LLC",
    description: "Accede a herramientas digitales profesionales en segundos.",
    url: "https://motostorellc.com/registro",
    siteName: "Moto Store LLC",
    type: "website",
    images: [{ url: "https://motostorellc.com/og/registro-motostore.png", width: 1200, height: 630 }],
  },
};

export default function RegisterPage() {
  const BRAND_RED = 'text-[#E33127]';

  return (
    // 2. LIENZO BLANCO (Clean Canvas - Sin scroll interno feo)
    <main className="flex flex-col min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- ZONA SUPERIOR --- */}
      <Header />
      <div className="w-full my-1 border-none outline-none z-40 relative">
        <MarqueeBar text={ANUNCIO_BARRA} styleType="minimal" />
      </div>
      <NavigationHome />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <section className="flex-1 relative py-12 md:py-20 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Decoración de fondo (Destello Rojo Marca) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl opacity-40 pointer-events-none -z-10"></div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center max-w-3xl">
          
          {/* LOGO E IDENTIDAD */}
          <div className="mb-10 flex flex-col items-center text-center">
             <div className="relative w-24 h-24 mb-6 transition-transform hover:scale-105 duration-500">
                <Image
                  src="/motostore-logo.png"
                  alt="Moto Store LLC Logo"
                  fill
                  className="object-contain"
                  priority
                />
             </div>
             
             {/* TÍTULO EN ULTRA NEGRITA (font-black) */}
             <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
               Únete a <span className={BRAND_RED}>Moto Store LLC</span>
             </h1>
             
             <p className="text-slate-600 text-sm md:text-base font-black tracking-wide uppercase">
               REGISTRO DE USUARIO NUEVO
             </p>
             <p className="text-slate-500 text-sm mt-3 font-bold max-w-md">
               Completa la información a continuación para activar tu acceso inmediato al sistema.
             </p>
          </div>

          {/* FORMULARIO INTEGRADO 
              - Sin scroll interno (overflow-y-auto ELIMINADO para mejor UX).
              - Estilo cristal (backdrop-blur).
          */}
          <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
             <LocationSelectProvider>
                <RegisterForm />
             </LocationSelectProvider>
          </div>

          {/* Copyright */}
          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-black tracking-wider uppercase">
              © {new Date().getFullYear()} Moto Store LLC. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />

    </main>
  );
}

