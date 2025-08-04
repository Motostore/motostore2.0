// src/app/child-layout.tsx
'use client';
import { SessionProvider } from "next-auth/react";
import { inter } from '@/app/ui/fonts';

// Importa los estilos CSS de Font Awesome
import '@fortawesome/fontawesome-svg-core/styles.css'; // <-- ESTA LÍNEA ES CRUCIAL
// Importa la configuración de Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core'; // <-- ESTA LÍNEA ES CRUCIAL

// Deshabilita la adición automática de CSS para evitar FOUC
config.autoAddCss = false; // <-- ESTA LÍNEA ES CRUCIAL

export default function ChildLayout({children}) {

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}