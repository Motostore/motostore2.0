'use client';

import Link from 'next/link';

export default function InicioPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Inicio</h1>
      <p className="text-sm text-gray-600">
        Bienvenido al panel. Selecciona una sección para continuar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <h2 className="font-medium">Productos</h2>
          <p className="text-sm text-gray-600">Catálogo de productos y servicios.</p>
        </Link>

        <Link
          href="/dashboard/transactions"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <h2 className="font-medium">Transacciones</h2>
          <p className="text-sm text-gray-600">Movimientos y estados.</p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <h2 className="font-medium">Configuración</h2>
          <p className="text-sm text-gray-600">Preferencias de la cuenta.</p>
        </Link>
      </div>
    </div>
  );
}
