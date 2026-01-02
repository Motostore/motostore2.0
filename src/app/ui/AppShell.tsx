// src/app/ui/AppShell.tsx
'use client';

// 🛑 MODIFICACIÓN ULTRA PREMIUM:
// Hemos eliminado la importación de 'SideNav' y la lógica de renderizado condicional.
// Ahora este componente es un contenedor transparente ("Passthrough") que permite
// que el DashboardLayout tome el control total del diseño.

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Simplemente devolvemos los hijos sin envolverlos en estructuras flexibles
  // ni inyectar barras laterales.
  return <>{children}</>;
}




