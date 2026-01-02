'use client';

import { useEffect, useMemo, useState } from 'react';
import { ListBulletIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Iconos para estética

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

        // Lógica de normalización robusta:
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
    <main className="p-6 md:p-10 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
        
        {/* ENCABEZADO PREMIUM */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-2">
            <ListBulletIcon className="w-6 h-6 text-[#E33127]" />
            Prueba de Roles de API
        </h1>
        <p className="text-sm text-slate-500 mb-4 border-b border-slate-100 pb-4">
            Verificando los roles disponibles desde: <code>{base}/users/roles</code>
        </p>

        {/* ESTADOS DE CARGA/ERROR */}
        {loading && (
            <p className="flex items-center gap-2 text-slate-600 font-medium">
                <ArrowPathIcon className="w-4 h-4 animate-spin text-slate-400" /> Cargando roles...
            </p>
        )}
        {err && <p className="text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">Error de conexión: {err}</p>}
        {!loading && !err && roles.length === 0 && <p className="text-slate-500">Sin datos de roles. La ruta no devolvió información.</p>}

        {/* TABLA DE RESULTADOS PREMIUM */}
        {!loading && !err && roles.length > 0 && (
          <table className="w-full max-w-lg mt-6 text-sm border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left border-b border-slate-200 px-4 py-3 font-bold text-slate-600 uppercase">Nombre de Rol</th>
                <th className="text-left border-b border-slate-200 px-4 py-3 font-bold text-slate-600 uppercase">Código Interno</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, i) => {
                const code = r.code ?? r.value ?? r.name ?? `role-${i}`;
                const label = r.label ?? code;
                return (
                  <tr key={code} className="even:bg-slate-50 hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 border-b border-slate-100">{label}</td>
                    <td className="px-4 py-3 text-slate-600 border-b border-slate-100">
                      <code className="bg-slate-200 rounded px-1 text-xs">{code}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* VISTA CRUDA */}
        <details className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
          <summary className="cursor-pointer font-bold text-slate-700">Ver respuesta cruda (JSON)</summary>
          <pre className="mt-3 bg-slate-800 text-green-400 p-4 rounded-lg text-xs overflow-auto">
{JSON.stringify(raw, null, 2)}
          </pre>
        </details>
      </div>
    </main>
  );
}

