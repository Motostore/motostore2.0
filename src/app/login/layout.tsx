// src/app/login/layout.tsx
'use client';

import Header from '../ui/header';
import Navigation from '../ui/navigation';
import Footer from '../ui/footer';
import { ProfileProvider } from '../Context/profileContext';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-700 bg-white">
      {/* Header con el saludo y botón "Salir" tal como lo tienes */}
      <Header />

      {/* Barra de navegación */}
      <div className="w-100 h-100">
        <span className="motostore-advice hidden">Anuncios aquí</span>
        <hr className="w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto my-2" />
        <Navigation />
      </div>

      {/* Contenido de la página de login */}
      <ProfileProvider>
        <div className="flex grow flex-col gap-4 md:flex-row pt-10">
          <div className="flex flex-col w-full">
            {children}
          </div>
        </div>
      </ProfileProvider>

      {/* Footer */}
      <Footer />
    </main>
  );
}

