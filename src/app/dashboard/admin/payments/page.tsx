// src/app/dashboard/admin/payments/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  adminListPaymentMethods,
  adminUpsertPaymentMethod,
  adminDeletePaymentMethod,
  type PaymentMethod,
} from '../../../lib/admin.payments';
import { can } from '../../../rbac/permissions';

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const allowed = can(session?.user?.role, 'payments:methods:write');

  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  async function load() {
    if (!token) return;
    try {
      setLoading(true); setErr(null);
      const list = await adminListPaymentMethods(token);
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) { setErr(e?.message ?? 'Error cargando métodos de pago'); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (allowed && token) load(); /* eslint-disable-next-line */ }, [allowed, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    try {
      setLoading(true); setErr(null);
      await adminUpsertPaymentMethod({ id: editingId ?? undefined, name: name.trim(), enabled }, token);
      setEditingId(null); setName(''); setEnabled(true);
      await load();
    } catch (e: any) { setErr(e?.message ?? 'Error guardando método de pago'); }
    finally { setLoading(false); }
  }

  function onEdit(m: PaymentMethod) { setEditingId(m.id!); setName(m.name); setEnabled(!!m.enabled); }

  async function onDelete(id: number | string) {
    if (!token) return;
    if (!confirm('¿Eliminar este método de pago?')) return;
    try { setLoading(true); await adminDeletePaymentMethod(id, token); await load(); }
    catch (e: any) { setErr(e?.message ?? 'Error eliminando método de pago'); }
    finally { setLoading(false); }
  }

  if (!allowed) return <div className="p-4">No autorizado.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Métodos de pago</h1>

      <form onSubmit={onSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded border px-2 py-1" placeholder="Ej: PayPal, Zelle" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
          <span>Habilitado</span>
        </label>
        <button disabled={loading} className="rounded bg-emerald-600 text-white px-3 py-2 disabled:opacity-50">
          {editingId == null ? 'Crear' : 'Guardar cambios'}
        </button>
      </form>

      {err && <div className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Habilitado</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && <tr><td colSpan={4} className="px-3 py-3">Cargando…</td></tr>}
            {items.map((m) => (
              <tr key={String(m.id)} className="border-t">
                <td className="px-3 py-2">{String(m.id ?? '')}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">{m.enabled ? 'Sí' : 'No'}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>onEdit(m)} className="px-2 py-1 rounded border">Editar</button>
                  <button onClick={()=>onDelete(m.id!)} className="px-2 py-1 rounded border text-red-700">Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && <tr><td colSpan={4} className="px-3 py-3">Sin métodos de pago.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

