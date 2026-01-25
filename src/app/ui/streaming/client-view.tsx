"use client";

import { 
  PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon, 
  ServerStackIcon, TvIcon, MusicalNoteIcon, PlayCircleIcon, 
  ExclamationTriangleIcon, CalendarDaysIcon, CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { formatDateToLocal } from "@/app/lib/utils";
import SecretVault from "@/app/ui/streaming/secret-vault";

// Detectar fechas críticas (menos de 3 días)
const isNearExpiry = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 3 && diffDays >= 0; 
};

// Detectar ya vencidos
const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
};

const getCategoryIcon = (cat?: string | null) => {
  if (cat === "Musica") return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
  if (cat === "IPTV") return <TvIcon className="w-5 h-5 text-orange-500" />;
  return <PlayCircleIcon className="w-5 h-5 text-red-500" />;
};

export default function AdminView({ items, loading, loadData, onAdd }: any) {
  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Almacén <span className="text-[#E33127]">Central</span></h1>
            <p className="text-sm text-slate-500 font-medium">Control de Stock, Fechas de Corte y Proveedores.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 shadow-sm" title="Refrescar">
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button onClick={onAdd} className="flex items-center gap-2 bg-slate-900 hover:bg-[#E33127] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <PlusIcon className="w-5 h-5" /> <span>Agregar Stock</span>
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-7 top-6.5" />
        <input type="text" placeholder="Buscar por cliente, cuenta, proveedor..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#E33127] transition-colors" />
      </div>

      {/* TABLA DE INVENTARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {loading && <div className="p-20 text-center text-slate-400 font-bold">Cargando inventario...</div>}
        
        {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-70">
                <ServerStackIcon className="w-16 h-16 text-slate-200 mb-4"/>
                <h3 className="text-lg font-bold text-slate-400">Almacén Vacío</h3>
                <p className="text-sm text-slate-400 mb-4">No hay productos en stock.</p>
                <button onClick={onAdd} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">
                    Registrar Primer Lote
                </button>
            </div>
        )}
        
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Credenciales</th>
                  
                  {/* COLUMNAS DE FECHAS */}
                  <th className="px-6 py-4 text-[10px] font-black text-red-400 uppercase tracking-wider text-center">Corte Prov.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-green-600 uppercase tracking-wider text-center">Corte Cliente</th>
                  
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => {
                    // Lógica de Alertas
                    const alertProvider = isNearExpiry(item.providerDueDate) || isExpired(item.providerDueDate);
                    const alertClient = isNearExpiry(item.clientDueDate) || isExpired(item.clientDueDate);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Producto */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">{getCategoryIcon(item.category)}</div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{item.provider}</div>
                                <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded inline-block mt-1 uppercase font-bold tracking-wide">{item.type}</div>
                            </div>
                          </div>
                        </td>

                        {/* Credenciales */}
                        <td className="px-6 py-4">
                            <div className="space-y-1">
                                <div className="flex gap-1 text-xs items-center"><span className="font-bold text-slate-400 w-4">U:</span> <span className="text-slate-700 select-all">{item.user}</span></div>
                                <div className="flex gap-1 text-xs items-center"><span className="font-bold text-slate-400 w-4">P:</span> <SecretVault text={item.key || ""} /></div>
                            </div>
                        </td>

                        {/* FECHA PROVEEDOR (Alerta Roja) */}
                        <td className="px-6 py-4 text-center">
                            <div className={`flex flex-col items-center justify-center ${alertProvider ? 'animate-pulse' : ''}`}>
                                <span className={`text-xs font-bold flex items-center gap-1 ${alertProvider ? 'text-red-600' : 'text-slate-500'}`}>
                                    {alertProvider && <ExclamationTriangleIcon className="w-3.5 h-3.5"/>}
                                    {formatDateToLocal(item.providerDueDate || item.dueDate)}
                                </span>
                                {alertProvider && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 rounded uppercase font-black mt-1">Renovar</span>}
                            </div>
                        </td>

                        {/* FECHA CLIENTE (Alerta Ambar/Verde) */}
                        <td className="px-6 py-4 text-center">
                             <div className="flex flex-col items-center justify-center">
                                <span className={`text-xs font-bold flex items-center gap-1 ${alertClient ? 'text-amber-600' : 'text-slate-700'}`}>
                                    {alertClient && <CalendarDaysIcon className="w-3.5 h-3.5"/>}
                                    {formatDateToLocal(item.clientDueDate || item.dueDate)}
                                </span>
                                {alertClient && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 rounded uppercase font-black mt-1">Cobrar</span>}
                            </div>
                        </td>

                        {/* Estado y Precio */}
                        <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${item.busy ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {item.busy ? 'Vendido' : 'Stock'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono" title="Costo vs Precio">
                                    ${item.cost} / <span className="text-green-600 font-bold">${item.price}</span>
                                </span>
                            </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-transparent hover:border-blue-200 rounded-lg transition-all"><PencilSquareIcon className="w-4 h-4"/></button>
                                <button className="p-2 text-slate-400 hover:text-red-600 bg-white border border-transparent hover:border-red-200 rounded-lg transition-all"><TrashIcon className="w-4 h-4"/></button>
                             </div>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}