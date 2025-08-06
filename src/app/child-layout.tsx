// src/app/child-layout.tsx
'use client';
import { SessionProvider } from "next-auth/react";
import { inter } from '@/app/ui/fonts';

// Importa los estilos CSS de Font Awesome
import '@fortawesome/fontawesome-svg-core/styles.css';
// Importa la configuración de Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core';

// Deshabilita la adición automática de CSS para evitar FOUC
config.autoAddCss = false;

// ¡IMPORTA Analytics aquí!
import { Analytics } from '@vercel/analytics/react'; 

export default function ChildLayout({children}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics /> {/* ¡AÑADE EL COMPONENTE ANALYTICS AQUÍ! */}
      </body>
    </html>
  )
}