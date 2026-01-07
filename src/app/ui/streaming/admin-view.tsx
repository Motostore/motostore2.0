"use client";

import { 
  PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon, 
  ServerStackIcon, TvIcon, MusicalNoteIcon, PlayCircleIcon 
} from "@heroicons/react/24/outline";
import { formatDateToLocal } from "@/app/lib/utils";
import SecretVault from "@/app/ui/streaming/secret-vault";

const getCategoryIcon = (cat?: string | null) => {
  if (cat === "Musica") return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
  if (cat === "IPTV") return <TvIcon className="w-5 h-5 text-orange-500" />;
  return <PlayCircleIcon className="w-5 h-5 text-red-500" />;
};

export default function AdminView({ items, loading, loadData, onAdd }: any) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Inventario <span className="text-red-600">Streaming</span></h1>
            <p className="text-sm text-slate-500 font-medium">Gestión de Cuentas y Accesos</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 shadow-sm">
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          {/* 🔥 CORRECCIÓN: SOLO MOSTRAMOS ESTE BOTÓN SI YA HAY ITEMS */}
          {items.length > 0 && (
            <button onClick={onAdd} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                <PlusIcon className="w-5 h-5" /> <span>Agregar</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-7 top-6.5" />
        <input type="text" placeholder="Buscar cuenta, usuario..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-red-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {loading && <div className="p-20 text-center text-slate-400 font-bold">Cargando inventario...</div>}
        
        {/* ESTADO VACÍO (Aquí sale el botón GRANDE) */}
        {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-70">
                <ServerStackIcon className="w-16 h-16 text-slate-200 mb-4"/>
                <h3 className="text-lg font-bold text-slate-400">Sin Cuentas</h3>
                <button onClick={onAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg mt-4">
                    Registrar Primera Cuenta
                </button>
            </div>
        )}
        
        {/* TABLA DE DATOS */}
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Producto</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Credenciales</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Finanzas</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">Estado</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">{getCategoryIcon(item.category)}</div>
                        <div><div className="font-bold text-slate-800 text-sm">{item.provider}</div><div className="text-xs text-slate-400 font-medium">{formatDateToLocal(item.dueDate)}</div></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 tracking-wide">{item.type}</span></td>
                    <td className="px-6 py-4"><div className="space-y-1"><div className="flex gap-1 text-xs"><span className="font-bold text-slate-400">U:</span> {item.user}</div><div className="flex gap-1 text-xs"><span className="font-bold text-slate-400">P:</span> <SecretVault text={item.key || ""} /></div></div></td>
                    <td className="px-6 py-4"><div className="flex flex-col text-xs gap-1"><div className="flex justify-between w-24 border-b border-slate-100 pb-1"><span className="text-slate-400">Costo:</span> <span className="font-mono text-slate-500">${item.cost?.toFixed(2)}</span></div><div className="flex justify-between w-24"><span className="font-bold text-slate-900">Venta:</span> <span className="font-mono text-green-600 font-bold">${item.price?.toFixed(2)}</span></div></div></td>
                    <td className="px-6 py-4 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${item.busy ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{item.busy ? 'Disp.' : 'Agotado'}</span></td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2"><button className="p-2 text-slate-400 hover:text-blue-600"><PencilSquareIcon className="w-5 h-5"/></button><button className="p-2 text-slate-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}