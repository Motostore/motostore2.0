'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const HOME_BY_ROLE: Record<string, string> = {
  SUPERUSER: '/dashboard/super',
  ADMIN: '/dashboard/admin',
  
  // ROLES DE DISTRIBUCIÓN
  DISTRIBUTOR: '/dashboard/distributor',
  RESELLER: '/dashboard/distributor', // Mismo dashboard para Reseller y Distribuidor principal
  SUBDISTRIBUTOR: '/dashboard/subdistributor', // Dashboard específico
  
  // ROLES DE TAQUILLA
  TAQUILLA: '/dashboard/ticket',
  SUBTAQUILLA: '/dashboard/subticket', 
  SUSTAQUILLA: '/dashboard/subticket', 
  
  // ROL DE USUARIO FINAL
  CLIENT: '/dashboard/client-info',
};

export default function WebRoot() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Detiene la ejecución mientras se carga la sesión
    if (status === 'loading') return;
    
    // Normaliza el rol a mayúsculas. Por defecto, usa 'CLIENT' si el rol es nulo.
    const role = String(session?.user?.role ?? 'CLIENT').toUpperCase();
    
    // Redirige al dashboard específico.
    // Usa HOME_BY_ROLE.CLIENT si el rol no se encuentra en el mapa (safety default).
    router.replace(HOME_BY_ROLE[role] ?? HOME_BY_ROLE.CLIENT);
  }, [status, session, router]);

  // Pantalla de carga (Estilo Premium)
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <ArrowPathIcon className="w-8 h-8 text-[#E33127] animate-spin mb-4" />
            <p className="text-lg font-semibold text-slate-700">
                ¡Bienvenido! Redirigiendo a tu panel de control...
            </p>
            <p className="text-sm text-slate-500 mt-1">
                Por favor, espera un momento.
            </p>
        </div>
    </div>
  );
}