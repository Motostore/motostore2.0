// src/app/dashboard/UserBox.tsx (Mejorado con Tipado y Clases CSS)
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

// 💡 Mejora 1: Definir la interfaz de usuario esperada para evitar 'as any'
interface CustomUser {
  username?: string;
  name?: string;
  role?: string;
  token?: string; // Asumiendo que adjuntas el token a la sesión
}

export default function UserBox() {
  const { data } = useSession();
  
  // 💡 Mejora 1: Usamos la interfaz tipada
  const user: CustomUser = (data?.user as CustomUser) || {};

  return (
    // 💡 Mejora 2: Uso de clases CSS en lugar de estilos en línea
    <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
      <h3 className="mt-0 text-lg font-semibold border-b pb-2 mb-2">Sesión activa</h3>
      <p className="text-sm">
        <b>Usuario:</b> {user.username || user.name || '—'}
      </p>
      <p className="text-sm">
        <b>Rol:</b> {user.role || '—'}
      </p>

      {user.token && (
        <details className="mt-4 border-t pt-2">
          <summary className="text-sm cursor-pointer hover:text-blue-600">Ver token</summary>
          <code className="block bg-gray-100 p-2 text-xs mt-2 overflow-x-auto whitespace-pre-wrap break-all">
            {user.token}
          </code>
        </details>
      )}

      <div className="flex gap-3 mt-4 pt-3 border-t">
        <Link href="/roles-test" className="text-blue-600 hover:underline text-sm">
          Ver roles
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
