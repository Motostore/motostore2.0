'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createProduct, fetchCategories } from "@/app/lib/products.service";
import { useRouter } from "next/navigation";
import { can } from "@/app/rbac/permissions";

export default function NewProductPage(){
  const { data: session } = useSession();
  const token = (session as any)?.user?.token || null;
  const role  = (session as any)?.user?.role  || "CLIENT";
  const router = useRouter();

  const [cats, setCats] = useState<Array<{id:number; name:string;}>>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  useEffect(()=>{ (async ()=>{
    const c = await fetchCategories();
    setCats(c);
  })();},[]);

  if (!can(role, "products:write") && role !== "SUPERUSER") {
    return <div className="p-6 text-sm text-red-600">No tienes permiso para crear productos.</div>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try{
      setStatus('loading');
      await createProduct({ name, price, description, categoryId: Number(categoryId) }, token ?? undefined);
      setStatus('ok');
      router.push('/dashboard/products');
    }catch(err:any){
      setStatus('error');
      setMsg(String(err?.message || err || 'Error'));
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-3">Nuevo producto</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500">Nombre</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Precio</label>
          <input type="number" step="0.01" className="border rounded px-3 py-2 w-full" value={price} onChange={e=>setPrice(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Categoría</label>
          <select className="border rounded px-3 py-2 w-full" value={categoryId} onChange={e=>setCategoryId(Number(e.target.value))} required>
            <option value="" disabled>Selecciona una categoría</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">Descripción</label>
          <textarea className="border rounded px-3 py-2 w-full" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <button disabled={status==='loading'} className="rounded bg-orange-600 text-white px-4 py-2 hover:bg-orange-700">
            {status==='loading' ? 'Guardando…' : 'Guardar'}
          </button>
          {status==='error' && <span className="text-sm text-red-600">{msg}</span>}
        </div>
      </form>
    </div>
  )
}
