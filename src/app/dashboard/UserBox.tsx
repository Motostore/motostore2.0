'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UserBox() {
  const { data } = useSession();
  const user = (data?.user as any) || {};

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Sesión activa</h3>
      <p><b>Usuario:</b> {user.username || user.name || '—'}</p>
      <p><b>Rol:</b> {user.role || '—'}</p>

      {user.token && (
        <details style={{ marginTop: 8 }}>
          <summary>Ver token</summary>
          <code style={{ display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {user.token}
          </code>
        </details>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link href="/roles-test">Ver roles</Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar sesión</button>
      </div>
    </div>
  );
}
