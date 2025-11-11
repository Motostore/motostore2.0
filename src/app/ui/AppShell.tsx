// src/app/ui/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import SideNav from './dashboard/sidenav';

/**
 * AppShell: contenedor con sidebar a la izquierda y contenido a la derecha.
 * Se usa en algunas vistas internas. Si la ruta empieza con /dashboard
 * pintamos el SideNav del dashboard (sin "Quiénes somos").
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (!isDashboard) {
    // Si quisieras otro shell público, lo podrías poner aquí. Por ahora
    // sólo devolvemos el contenido.
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-screen-2xl md:px-6 flex">
      <SideNav />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}




