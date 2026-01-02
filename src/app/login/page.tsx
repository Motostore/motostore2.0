// src/app/login/page.tsx (EDICIÓN FINAL: ULTRA PREMIUM ORO PRO +++)

import type { Metadata } from "next";
import Form from "./form"; 
import Image from "next/image"; 

// 1. IMPORTAMOS EL ECOSISTEMA UNIFICADO
import Header from "../ui/header";
import NavigationHome from "../ui/common/NavigationHome"; 
import MarqueeBar from "../ui/common/MarqueeBar";         
import Footer from "../ui/footer";
import { ANUNCIO_BARRA } from "../mensajes";              

// 2. SEO ULTRA PRO (Mantenemos tu configuración perfecta)
export const metadata: Metadata = {
  title: {
    absolute: "Iniciar sesión | Moto Store LLC",
  },
  description:
    "Accede a tu cuenta de Moto Store LLC para gestionar tus pedidos, herramientas y soluciones digitales 24/7.",
  keywords: [
    "login Moto Store",
    "iniciar sesión",
    "acceso plataforma",
    "soluciones digitales",
  ],
  alternates: {
    canonical: "https://motostorellc.com/login",
  },
  openGraph: {
    title: "Iniciar sesión | Moto Store LLC",
    description: "Entra a tu cuenta de Moto Store LLC y accede a tus herramientas digitales.",
    url: "https://motostorellc.com/login",
    siteName: "Moto Store LLC",
    type: "website",
    images: [
      {
        url: "https://motostorellc.com/og/login-motostore-2025.png",
        width: 1200,
        height: 630,
        alt: "Login Moto Store LLC",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Iniciar sesión | Moto Store LLC",
    description: "Accede a tu cuenta en la plataforma digital de Moto Store LLC.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  const BRAND_RED = 'text-[#E33127]';

  return (
    // 3. ESTRUCTURA 'CLEAN CANVAS' (Fondo Blanco, Sin bordes de ventana)
    <main className="flex flex-col min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- ZONA SUPERIOR --- */}
      <Header />
      <div className="w-full my-1 border-none outline-none z-40 relative">
        <MarqueeBar text={ANUNCIO_BARRA} styleType="minimal" />
      </div>
      <NavigationHome />

      {/* --- CONTENIDO PRINCIPAL (Login Centrado) --- */}
      <section className="flex-1 relative py-12 md:py-20 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Decoración de fondo (Destello Rojo Marca - Sutil y Elegante) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-40 pointer-events-none -z-10"></div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center max-w-lg">
          
          {/* LOGO E IDENTIDAD VISUAL */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-6 transition-transform hover:scale-105 duration-500">
              <Image
                src="/motostore-logo.png" 
                alt="Moto Store LLC Logo"
                fill
                className="object-contain"
                priority 
              />
            </div>

            {/* TÍTULO EN ULTRA NEGRITA (font-black) */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Bienvenido a <span className={BRAND_RED}>Moto Store</span>
            </h1>

            <p className="text-slate-600 text-sm font-black tracking-widest uppercase">
              INICIAR SESIÓN
            </p>
            
            <p className="text-slate-500 text-xs mt-3 font-bold max-w-xs">
              Ingresa tus credenciales para gestionar tu negocio digital.
            </p>
          </div>

          {/* FORMULARIO (CONTENEDOR CRISTAL) 
              - Fondo blanco con transparencia sutil.
              - Bordes redondeados modernos.
              - Sombra suave al pasar el mouse.
          */}
          <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Form />
          </div>

          {/* Copyright Discreto */}
          <div className="mt-10 text-center">
             <p className="text-[10px] text-slate-400 font-black tracking-wider uppercase">
               © {new Date().getFullYear()} Moto Store LLC. Seguridad Garantizada.
             </p>
          </div>

        </div>
      </section>

      {/* --- FOOTER INTEGRADO --- */}
      <Footer />

    </main>
  );
}















