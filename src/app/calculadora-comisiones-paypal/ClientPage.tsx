'use client';

import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./CalculadoraPaypal'), {
  ssr: false,
});

export default function ClientPage() {
  return (
    <main className="max-w-3xl mx-auto p-4 py-10">
      {/* Título eliminado para evitar duplicado */}
      <ClientComponent />
    </main>
  );
}



