'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebLanding() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/inicio');
  }, [router]);

  return <div className="p-6 text-sm text-gray-600">Redirigiendo a Inicio…</div>;
}



