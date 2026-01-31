import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// 1. CONFIGURACIÓN SEO (ALCANCE MUNDIAL)
export const metadata: Metadata = {
  title: "Moto Store LLC | Remesas Globales P2P, PayPal y Desarrollo Web",
  description:
    "Plataforma global de servicios digitales. Remesas y Cambios P2P Internacionales (Zelle, USDT, Euros, Bolívares). Agencia de Desarrollo Web, Marketing y Streaming Premium.",
  keywords: [
    "Moto Store LLC",
    "Remesas Internacionales",
    "Cambio P2P Global",
    "Exchange Crypto",
    "Vender USDT",
    "Zelle Exchange",
    "Envío de Dinero al Extranjero",
    "International Money Transfer",
    "Calculadora PayPal",
    "Vender Saldo PayPal",
    "Exchange PayPal",
    "Desarrollo Web",
    "Marketing Digital",
    "Diseño de Apps",
    "SEO",
    "Cuentas Streaming",
    "Licencias Digitales",
  ],
  alternates: {
    canonical: "https://motostorellc.com",
  },
  openGraph: {
    title: "Moto Store LLC | Servicios Financieros y Digitales Globales",
    description:
      "Tu puente financiero global. Cambios P2P seguros (Cripto/Fiat), Remesas Internacionales y Soluciones Web para tu negocio en cualquier parte del mundo.",
    url: "https://motostorellc.com",
    siteName: "Moto Store LLC",
    images: [
      {
        url: "/og/home-motostore-2025.png",
        width: 1200,
        height: 630,
        alt: "Moto Store LLC - Global Services",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moto Store LLC | Remesas y Tech Global",
    description:
      "Cambios P2P Internacionales, PayPal, Streaming y Desarrollo Web sin fronteras.",
    images: ["/og/home-motostore-2025.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  verification: {
    // ⚠️ Si ya verificaste por dominio (DNS), puedes dejar esto así. 
    // Si quieres usar el código de etiqueta, pégalo aquí abajo:
    // google: "TU_CODIGO_AQUI", 
  },
};

export default function HomePage() {
  
  // 2. DATOS ESTRUCTURADOS MEJORADOS (Para que salgan los enlaces en Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Moto Store LLC",
    "url": "https://motostorellc.com",
    "logo": "https://motostorellc.com/icon-192.png",
    "description": "Plataforma global de servicios financieros P2P, remesas internacionales y agencia digital.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-352-224-8881",
      "contactType": "customer service",
      "areaServed": "World",
      "availableLanguage": ["es", "en"]
    },
    // 🔥 ESTO ES LO QUE HACE QUE SALGAN LOS ENLACES ABAJO EN GOOGLE
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Calculadora PayPal",
        "description": "Calcula comisiones exactas de PayPal en tiempo real.",
        "url": "https://motostorellc.com/calculadorapaypal"
      },
      {
        "@type": "WebPage",
        "name": "Iniciar Sesión",
        "description": "Accede a tu cuenta de Moto Store LLC.",
        "url": "https://motostorellc.com/login"
      },
      {
        "@type": "WebPage",
        "name": "Registro",
        "description": "Crea una cuenta para enviar remesas y comprar servicios.",
        "url": "https://motostorellc.com/register"
      }
    ],
    "sameAs": [
      "https://facebook.com/MotoStoreLLC",
      "https://instagram.com/motostorellc",
      "https://tiktok.com/@motostorellc"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}


















