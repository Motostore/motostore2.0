'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HOME_BY_ROLE: Record<string, string> = {
  SUPERUSER: '/dashboard/super',
  ADMIN: '/dashboard/admin',
  DISTRIBUTOR: '/dashboard/distributor',
  SUBDISTRIBUTOR: '/dashboard/subdistributor',
  SUSTAQUILLA: '/dashboard/subticket',
  SUBTAQUILLA: '/dashboard/subticket',
  TAQUILLA: '/dashboard/ticket',
  CLIENT: '/dashboard/client-info',
};

export default function WebRoot() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const role = String(session?.user?.role ?? 'CLIENT').toUpperCase();
    router.replace(HOME_BY_ROLE[role] ?? HOME_BY_ROLE.CLIENT);
  }, [status, session, router]);

  return <div className="p-6 text-sm text-gray-600">Redirigiendo a tu panel…</div>;
}
