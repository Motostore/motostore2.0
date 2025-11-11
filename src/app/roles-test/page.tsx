'use client';

import { useEffect, useMemo, useState } from 'react';

type RoleOption = {
  code?: string;
  value?: string;
  label?: string;
  name?: string;
};

export default function RolesTestPage() {
  const base = useMemo(
    () => process.env.NEXT_PUBLIC_API_FULL ?? 'http://localhost:8080/api/v1',
    []
  );

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${base}/users/roles`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setRaw(data);

        // Soporta: array de objetos (preferido) o array de strings
        const list: RoleOption[] = Array.isArray(data)
          ? (typeof data[0] === 'string'
              ? (data as string[]).map((s) => ({ code: s, value: s, label: s, name: s }))
              : (data as RoleOption[]))
          : Array.isArray((data as any)?.roles)
            ? (data as any).roles
            : [];

        setRoles(list);
      })
      .catch((e: any) => setErr(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [base]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Roles (test)</h1>
      <p style={{ margin: '4px 0 16px' }}>
        <small>API base: <code>{base}</code></small>
      </p>

      {loading && <p>Cargando…</p>}
      {err && <p style={{ color: 'red' }}>Error: {err}</p>}
      {!loading && !err && roles.length === 0 && <p>Sin datos…</p>}

      {!loading && !err && roles.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Label</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Code</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r, i) => {
              const code = r.code ?? r.value ?? r.name ?? `role-${i}`;
              const label = r.label ?? code;
              return (
                <tr key={code}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{label}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', opacity: 0.8 }}>
                    <code>{code}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <details style={{ marginTop: 16 }}>
        <summary>Ver respuesta cruda</summary>
        <pre style={{ background: '#f7f7f7', padding: 12, borderRadius: 8, overflow: 'auto' }}>
{JSON.stringify(raw, null, 2)}
        </pre>
      </details>
    </main>
  );
}

