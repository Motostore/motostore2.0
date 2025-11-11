'use client';

import { useEffect, useState } from 'react';

type User = {
  id?: string | number;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  disabled?: boolean;
  [k: string]: any;
};

export default function UsersAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = text; }

        if (!res.ok) {
          setError(
            typeof data === 'string'
              ? data
              : JSON.stringify(data, null, 2)
          );
          setUsers([]);
        } else {
          const list: User[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];
          setUsers(list);
        }
      } catch (e: any) {
        setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Usuarios registrados</h1>

      {loading && <div>Cargando…</div>}

      {!loading && error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: 12, borderRadius: 8 }}>
          <b>No se pudo obtener la lista.</b>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>{error}</pre>
          <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
            Asegúrate de estar <b>logueado</b>. Si ves 403/404, tu backend puede
            requerir rol admin o no tener el endpoint de usuarios.
          </p>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', padding: 12, borderRadius: 8 }}>
          No hay usuarios para mostrar.
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 10 }}>ID</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Usuario</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Rol</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={(u.id ?? u.username ?? i).toString()} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{u.id ?? '-'}</td>
                  <td style={{ padding: 10 }}>{u.username ?? '-'}</td>
                  <td style={{ padding: 10 }}>{u.name ?? '-'}</td>
                  <td style={{ padding: 10 }}>{u.email ?? '-'}</td>
                  <td style={{ padding: 10 }}>{u.role ?? '-'}</td>
                  <td style={{ padding: 10 }}>{u.disabled ? 'Deshabilitado' : 'Activo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



