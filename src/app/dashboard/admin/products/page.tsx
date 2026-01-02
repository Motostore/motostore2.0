// src/app/dashboard/admin/products/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  type AdminProduct,
} from '../../../lib/admin.products';        // 👈 3 niveles arriba

import { can } from '../../../rbac/permissions';             // 👈 3 niveles arriba

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const allowed = can(session?.user?.role, 'products:write');

  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  async function load() {
    if (!token) return;
    try {
      setLoading(true); setErr(null);
      const list = await adminListProducts(token);
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErr(e?.message ?? 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (allowed && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim() || String(price).trim() === '') return;

    const payload: AdminProduct = { name: name.trim(), price: Number(price), active };
    try {
      setLoading(true); setErr(null);
      if (editingId == null) {
        await adminCreateProduct(payload, token);
      } else {
        await adminUpdateProduct(editingId, payload, token);
        setEditingId(null);
      }
      setName(''); setPrice(''); setActive(true);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Error guardando producto');
    } finally {
      setLoading(false);
    }
  }

  function onEdit(p: AdminProduct) {
    setEditingId(p.id!);
    setName(p.name);
    setPrice(p.price);
    setActive(!!p.active);
  }

  async function onDelete(id: number | string) {
    if (!token) return;
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      setLoading(true);
      await adminDeleteProduct(id, token);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Error eliminando producto');
    } finally {
      setLoading(false);
    }
  }

  if (!allowed) return <div className="p-4">No autorizado.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Productos (Admin)</h1>

      <form onSubmit={onSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Precio (USD)</label>
          <input
            value={price}
            onChange={e=>setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            type="number" step="0.01" min="0"
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
          <span>Activo</span>
        </label>
        <button
          disabled={loading}
          className="rounded bg-emerald-600 text-white px-3 py-2 disabled:opacity-50"
        >
          {editingId == null ? 'Crear' : 'Guardar cambios'}
        </button>
      </form>

      {err && (
        <div className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Precio</th>
              <th className="text-left px-3 py-2">Activo</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-3">Cargando…</td></tr>
            )}
            {items.map((p) => (
              <tr key={String(p.id)} className="border-t">
                <td className="px-3 py-2">{String(p.id ?? '')}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">
                  {new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' })
                    .format(Number(p.price || 0))}
                </td>
                <td className="px-3 py-2">{p.active ? 'Sí' : 'No'}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>onEdit(p)} className="px-2 py-1 rounded border">Editar</button>
                  <button onClick={()=>onDelete(p.id!)} className="px-2 py-1 rounded border text-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-3">Sin productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


