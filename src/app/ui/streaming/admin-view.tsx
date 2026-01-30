"use client";

import { useState } from "react";
import { 
  PlusIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon, 
  ServerStackIcon, TvIcon, MusicalNoteIcon, PlayCircleIcon, 
  ExclamationTriangleIcon, CalendarDaysIcon, 
  UserPlusIcon, ArrowPathRoundedSquareIcon 
} from "@heroicons/react/24/outline";
import { formatDateToLocal } from "@/app/lib/utils";
import SecretVault from "@/app/ui/streaming/secret-vault";
import { fetchRemoveProfile, createClientProfile } from "@/app/lib/streaming-profile"; 
import toast from "react-hot-toast";

const isNearExpiry = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 5 && diffDays >= 0; 
};

const getCategoryIcon = (cat?: string | null) => {
  if (cat === "Musica") return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
  if (cat === "IPTV") return <TvIcon className="w-5 h-5 text-orange-500" />;
  return <PlayCircleIcon className="w-5 h-5 text-[#E33127]" />;
};

export default function AdminView({ items, loading, loadData, onAdd }: any) {
  
  const handleAssign = async (item: any) => {
      const clientEmail = prompt("📧 Correo del Cliente:");
      if (!clientEmail) return;
      
      const days = prompt("📅 Días de servicio:", "30");
      if (!days) return;

      const today = new Date();
      today.setDate(today.getDate() + parseInt(days));
      const newDueDate = today.toISOString().split('T')[0];

      const updatedItem = {
          ...item,
          busy: true, 
          userAssigned: clientEmail, 
          originalUser: item.originalUser || item.user, 
          user: clientEmail, 
          clientDueDate: newDueDate,
      };

      try {
          await fetchRemoveProfile(item.id);
          await new Promise(r => setTimeout(r, 200)); 
          await createClientProfile(updatedItem); 
          toast.success(`Asignado a ${clientEmail}`);
          loadData();
      } catch (e) {
          toast.error("Error al asignar");
      }
  };

  const handleRecycle = async (item: any) => {
      if (!confirm(`¿Liberar perfil de ${item.userAssigned}?`)) return;

      const recycledItem = {
          ...item,
          busy: false, 
          userAssigned: null,
          clientDueDate: null,
          user: item.originalUser || item.user, 
      };

      try {
          await fetchRemoveProfile(item.id);
          await new Promise(r => setTimeout(r, 200));
          await createClientProfile(recycledItem);
          toast.success("Perfil liberado");
          loadData();
      } catch (e) {
          toast.error("Error al reciclar");
      }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("¿Eliminar definitivamente?")) return;
    try {
      await fetchRemoveProfile(id);
      toast.success("Eliminado");
      loadData();
    } catch (error) { toast.error("Error al eliminar"); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Almacén <span className="text-[#E33127]">Inteligente</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
                Inventario: <span className="text-green-600 font-bold">{items.filter((i:any) => !i.busy).length} Libres</span> | <span className="text-blue-600 font-bold">{items.filter((i:any) => i.busy).length} Vendidos</span>
            </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-[#E33127] hover:border-[#E33127] transition-colors shadow-sm">
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          {/* 🔥 CORREGIDO: BOTÓN ROJO (ERA NEGRO) */}
          <button onClick={onAdd} className="flex items-center gap-2 bg-[#E33127] hover:bg-[#c42820] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <PlusIcon className="w-5 h-5" /> <span>Cargar Lote</span>
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-7 top-6.5" />
        <input type="text" placeholder="Buscar por cliente, cuenta, proveedor..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#E33127] transition-colors" />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {loading && <div className="p-20 text-center text-slate-400 font-bold">Cargando inventario...</div>}

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Credenciales</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#E33127] uppercase tracking-wider text-center">Corte Prov.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-green-600 uppercase tracking-wider text-center">Cliente</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => {
                    const alertProvider = isNearExpiry(item.providerDueDate);
                    
                    return (
                      <tr key={item.id} className={`transition-colors ${item.busy ? 'bg-white' : 'bg-green-50/30'}`}>
                        
                        {/* Producto */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">{getCategoryIcon(item.category)}</div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{item.provider}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{item.type}</div>
                            </div>
                          </div>
                        </td>

                        {/* Credenciales */}
                        <td className="px-6 py-4">
                            <div className="space-y-1">
                                <div className="flex gap-1 text-xs items-center"><span className="font-bold text-slate-400 w-4">U:</span> <span className="text-slate-700 select-all">{item.originalUser || item.user}</span></div>
                                <div className="flex gap-1 text-xs items-center"><span className="font-bold text-slate-400 w-4">P:</span> <SecretVault text={item.key || ""} /></div>
                            </div>
                        </td>

                        {/* Fecha Proveedor */}
                        <td className="px-6 py-4 text-center">
                            <div className={`flex flex-col items-center ${alertProvider ? 'animate-pulse' : ''}`}>
                                <span className={`text-xs font-bold ${alertProvider ? 'text-[#E33127]' : 'text-slate-500'}`}>
                                    {formatDateToLocal(item.providerDueDate)}
                                </span>
                                {alertProvider && <span className="text-[9px] bg-[#E33127] text-white px-1.5 rounded uppercase font-black mt-1">¡PAGAR!</span>}
                            </div>
                        </td>

                        {/* Estado / Cliente */}
                        <td className="px-6 py-4 text-center">
                            {item.busy ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]" title={item.userAssigned}>
                                        {item.userAssigned}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                                        Vendido
                                    </span>
                                </div>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                                    Disponible
                                </span>
                            )}
                        </td>

                        {/* Botones */}
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                {item.busy ? (
                                    <button onClick={() => handleRecycle(item)} className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all" title="Reciclar">
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5"/>
                                    </button>
                                ) : (
                                    // 🔥 CORREGIDO: BOTÓN ROJO (ERA NEGRO)
                                    <button onClick={() => handleAssign(item)} className="flex items-center gap-1 bg-[#E33127] hover:bg-[#c42820] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-md">
                                        <UserPlusIcon className="w-3.5 h-3.5"/> Vender
                                    </button>
                                )}
                                
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-[#E33127] transition-colors"><TrashIcon className="w-4 h-4"/></button>
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