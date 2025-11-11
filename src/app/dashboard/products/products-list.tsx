'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { can } from "@/app/rbac/permissions";
import { fetchAllProducts } from "@/app/lib/products.service";

type Cat = { id:number; name:string; slug:string; active:boolean };
type Prod = {
  id:number; name:string; description?:string; price:number;
  categoryId:number; categoryName?:string; active:boolean
};

export default function ProductsList({
  initialProducts,
  categories,
  token,
  role
}: {
  initialProducts: Prod[];
  categories: Cat[];
  token?: string | null;
  role?: string;
}) {
  const [items, setItems] = useState<Prod[]>(initialProducts);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [q, setQ] = useState('');

  const canWrite = useMemo(() => can(role, "products:write") || can(role, "*" as any), [role]);

  useEffect(() => {
    (async () => {
      const res = await fetchAllProducts({
        categoryId: categoryId === '' ? undefined : Number(categoryId),
        q: q || undefined
      });
      setItems(res);
    })();
  }, [categoryId, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-500">Categoría</label>
          <select
            value={categoryId}
            onChange={(e)=>setCategoryId(e.target.value ? Number(e.target.value) : '')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Todas</option>
            {categories.map(c=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500">Buscar</label>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Nombre del producto…"
            className="border rounded px-2 py-1 text-sm w-56"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <Link href="/dashboard/products/categories" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">
            Categorías
          </Link>
          {canWrite && (
            <Link href="/dashboard/products/new" className="rounded bg-orange-600 text-white px-3 py-1.5 text-sm hover:bg-orange-700">
              Nuevo producto
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left border-b">Nombre</th>
              <th className="px-3 py-2 text-left border-b">Categoría</th>
              <th className="px-3 py-2 text-right border-b">Precio</th>
              <th className="px-3 py-2 text-left border-b">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{p.name}</td>
                <td className="px-3 py-2 border-b">{p.categoryName ?? p.categoryId}</td>
                <td className="px-3 py-2 border-b text-right">${p.price.toFixed(2)}</td>
                <td className="px-3 py-2 border-b">{p.description ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
