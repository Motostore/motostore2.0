'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { can } from "@/app/rbac/permissions";
import { createCategory, fetchCategories } from "@/app/lib/products.service";

type Cat = { id:number; name:string; slug:string; active:boolean };

export default function CategoriesPage(){
  const { data: session } = useSession();
  const token = (session as any)?.user?.token || null;
  const role  = (session as any)?.user?.role  || "CLIENT";

  const [list, setList] = useState<Cat[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'error'|'ok'>('idle');
  const [msg, setMsg] = useState('');

  const canWrite = can(role, "products:write") || can(role, "*");

  async function load() {
    const cats = await fetchCategories();
    setList(cats);
  }
  useEffect(()=>{ load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    try{
      setStatus('loading');
      await createCategory(name, token ?? undefined);
      setName('');
      await load();
      setStatus('ok');
    }catch(err:any){
      setStatus('error');
      setMsg(String(err?.message || err || 'Error'));
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-3">Categorías</h1>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Nombre de la nueva categoría"
          value={name}
          onChange={e=>setName(e.target.value)}
          disabled={!canWrite}
        />
        <button
          className="rounded bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:opacity-50"
          disabled={!canWrite || !name.trim() || status==='loading'}
        >
          {status==='loading' ? 'Creando…' : 'Crear'}
        </button>
      </form>
      {status==='error' && <p className="text-sm text-red-600 mb-2">{msg}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left border-b">ID</th>
              <th className="px-3 py-2 text-left border-b">Nombre</th>
              <th className="px-3 py-2 text-left border-b">Slug</th>
              <th className="px-3 py-2 text-left border-b">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c=>(
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{c.id}</td>
                <td className="px-3 py-2 border-b">{c.name}</td>
                <td className="px-3 py-2 border-b">{c.slug}</td>
                <td className="px-3 py-2 border-b">{c.active ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">Sin categorías</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
