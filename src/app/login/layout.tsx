// src/app/login/layout.tsx (CONTENEDOR INVISIBLE - NIVEL PRO)

import React from 'react'; 

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🔥 IMPORTANTE: 
    // 1. Usamos 'bg-white' para mantener la continuidad del lienzo.
    // 2. ELIMINAMOS 'flex items-center justify-center' porque el page.tsx ya maneja el diseño completo.
    // 3. Este archivo solo sirve para pasar el contenido sin interferir.
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {children}
    </div>
  );
}





