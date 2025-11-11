// src/app/QuienesSomos/layout.tsx
'use client';

import Header from '../ui/header';
import Navigation from '../ui/navigation';
import Footer from '../ui/footer';
import { ProfileProvider } from '../Context/profileContext'; // Asegúrate de que este Contexto sea necesario aquí

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden text-gray-700 bg-white">
      {/* Proveedor de perfil para acceso global al contexto */}
      <ProfileProvider>
        {/* Header - Barra superior con el logo, navegación y barra informativa */}
        <Header />

        {/* Barra de navegación */}
        <div className="w-full">
          <span className="motostore-advice hidden">Anuncios aquí</span>
          <hr className="w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto my-2" />
          <Navigation />
        </div>
      </ProfileProvider>

      {/* Contenedor para el contenido dinámico (páginas específicas) */}
      <div className="flex-grow flex flex-col gap-4 md:flex-row">
        <div className="flex flex-row justify-center items-start gap-6 px-6 py-6 md:px-16">
          {children}
        </div>
      </div>

      {/* Pie de página (Footer) */}
      <Footer />
    </main>
  );
}

