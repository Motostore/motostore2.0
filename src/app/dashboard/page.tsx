// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { homeByRole } from '@/app/lib/roles';

export default function DashboardIndex() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // espera a que termine la carga de la sesión

    // Ruta por defecto si no hay rol o no coincide
    let target = '/dashboard/products';

    try {
      const role = session?.user?.role;
      if (role) {
        const byRole = homeByRole(role);
        if (byRole && typeof byRole === 'string') {
          target = byRole;
        }
      }
    } catch {
      // si algo falla, mantenemos el fallback
    }

    router.replace(target);
  }, [status, session?.user?.role, router]);

  return (
    <div className="p-6 text-sm text-gray-600">
      Entrando al panel…
    </div>
  );
}

















