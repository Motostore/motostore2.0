// src/app/QuienesSomos/layout.tsx (LIMPIO - PARA EVITAR DUPLICADOS)

'use client';

import { ProfileProvider } from '../Context/profileContext'; 

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // CAMBIO CLAVE:
    // 1. Usamos 'bg-white' para mantener la continuidad del diseño limpio.
    // 2. Eliminamos Header, Navigation y Footer de aquí porque YA ESTÁN en page.tsx con el diseño nuevo.
    <main className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Mantenemos el ProfileProvider por si lo usas para datos de usuario */}
      <ProfileProvider>
        
        {/* Renderizamos solo los hijos (el contenido de page.tsx) */}
        {children}
        
      </ProfileProvider>

    </main>
  );
}

