// src/app/ayuda/page.tsx (EDICIÓN FINAL: SEO DE ALTO NIVEL)

import AyudaClient from './AyudaClient';
import { ProfileProvider } from '../Context/profileContext';
import type { Metadata } from 'next'; 

// 🏆 SEO PREMIUM: Configuración completa para Google y Redes Sociales
export const metadata: Metadata = {
  title: "Centro de Ayuda y Soporte | Moto Store LLC",
  description:
    "Aprende a usar nuestra plataforma, gestiona tus recargas y resuelve dudas frecuentes sobre métodos de pago y servicios digitales.",
  keywords: [
    "centro de ayuda",
    "soporte moto store",
    "tutoriales recargas",
    "preguntas frecuentes",
    "atención al cliente",
  ],
  alternates: {
    canonical: "https://motostorellc.com/ayuda",
  },
  // 🚀 OPEN GRAPH: Para que se vea increíble en WhatsApp y Facebook
  openGraph: {
    title: "Centro de Ayuda y Soporte | Moto Store LLC",
    description: "Tu guía completa para operar en nuestra plataforma digital.",
    url: "https://motostorellc.com/ayuda",
    siteName: "Moto Store LLC",
    type: "website",
    images: [
      {
        url: "https://motostorellc.com/og/help-center-cover.png", // Asegúrate de tener una imagen genérica aquí
        width: 1200,
        height: 630,
        alt: "Soporte Moto Store LLC",
      },
    ],
  },
  // 🐦 TWITTER CARD: Para compartir en X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Centro de Ayuda | Moto Store LLC",
    description: "Encuentra respuestas rápidas y tutoriales.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    // Contexto de Usuario activo para esta sección
    <ProfileProvider>
      <AyudaClient />
    </ProfileProvider>
  );
}























