"use client";

import { useState } from "react";
import { 
  PlusIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon, 
  ServerStackIcon, TvIcon, MusicalNoteIcon, PlayCircleIcon, 
  ExclamationTriangleIcon, CalendarDaysIcon, UserPlusIcon, ArrowPathRoundedSquareIcon
} from "@heroicons/react/24/outline";
import { formatDateToLocal } from "@/app/lib/utils";
import SecretVault from "@/app/ui/streaming/secret-vault";
import { fetchRemoveProfile, createClientProfile } from "@/app/lib/streaming-profile"; // createClientProfile lo usamos para actualizar (overwrite)
import toast from "react-hot-toast";

// 🔥 LÓGICA DE ALERTAS: 5 DÍAS PARA PROVEEDOR
const isNearExpiry = (dateStr: string, daysThreshold = 3) => {
    if (!dateStr) return false;
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= daysThreshold && diffDays >= 0; 
};

// Vencido
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
  
  // Función: ASIGNAR A CLIENTE (Venta)
  const handleAssign = async (item: any) => {
      const clientEmail = prompt("Ingrese el correo del Cliente (Login):");
      if (!clientEmail) return;
      
      const days = prompt("¿Cuántos días de servicio?", "30");
      if (!days) return;

      const today = new Date();
      today.setDate(today.getDate() + parseInt(days));
      const newDueDate = today.toISOString().split('T')[0];

      // Actualizamos el item
      const updatedItem = {
          ...item,
          busy: true, // Ahora está ocupado
          userAssigned: clientEmail, // Guardamos el dueño temporal
          clientDueDate: newDueDate,
          // IMPORTANTE: Para que el cliente lo vea en su panel,
          // el campo 'user' debe tener el correo del cliente.
          // Pero no queremos perder el correo original de la cuenta madre.
          // TRUCO: Guardamos el correo madre en 'originalUser' si no existe.
          originalUser: item.originalUser || item.user, 
          // Y ponemos el del cliente en 'user' para que el filtro funcione
          // (O usamos un campo 'assignedTo' y cambiamos el filtro en page.tsx, pero esto es más rápido por ahora)
      };

      try {
          // Usamos la misma función de crear para sobreescribir (tu backend debe soportar update o borramos y creamos)
          // Como tu backend actual es simple, vamos a hacer: Borrar Viejo -> Crear Nuevo Actualizado
          await fetchRemoveProfile(item.id);
          // Pequeño delay para evitar conflictos
          await new Promise(r => setTimeout(r, 200)); 
          await createClientProfile(updatedItem); 
          
          toast.success(`Asignado a ${clientEmail}`);
          loadData();
      } catch (e) {
          toast.error("Error al asignar");
      }
  };

  // Función: RECICLAR / CORTAR (Cliente no pagó o se fue)
  const handleRecycle = async (item: any) => {
      if (!confirm(`¿El cliente ${item.userAssigned || "actual"} no pagó? Se liberará el perfil.`)) return;

      const recycledItem = {
          ...item,
          busy: false, // Disponible otra vez
          userAssigned: null,
          clientDueDate: null,
          // Restauramos datos originales si los guardamos
          // (Si no, simplemente queda libre)
      };

      try {
          await fetchRemoveProfile(item.id);
          await new Promise(r => setTimeout(r, 200));
          await createClientProfile(recycledItem);
          
          toast.success("Perfil liberado y listo para venta");
          loadData();
      } catch (e) {
          toast.error("Error al reciclar");
      }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("¿Eliminar definitivamente del sistema?")) return;
    try {
      await fetchRemoveProfile(id);
      toast.success("Cuenta eliminada");
      loadData();
    } catch (error) { toast.error("Error al eliminar"); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Almacén <span className="text-[#E33127]">Inteligente</span></h1>
            <p className="text-sm text-slate-500 font-medium">Inventario: {items.filter((i:any) => !i.busy).length} Disponibles | {items.filter((i:any) => i.busy).length} Vendidos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 shadow-sm"><ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={onAdd} className="flex items-center gap-2 bg-slate-900 hover:bg-[#E33127] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <PlusIcon className="w-5 h-5" /> <span>Cargar Lote</span>
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Perfil / Cuenta</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-red-400 uppercase tracking-wider text-center">Prov. (5 Días)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-green-600 uppercase tracking-wider text-center">Cliente</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => {
                    // Alerta Proveedor: 5 días antes
                    const alertProvider = isNearExpiry(item.providerDueDate, 5);
                    const alertClient = isNearExpiry(item.clientDueDate, 2);

                    return (
                      <tr key={item.id} className={`transition-colors ${item.busy ? 'bg-white' : 'bg-green-50/30'}`}>
                        
                        {/* Info Cuenta */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">{getCategoryIcon(item.category)}</div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{item.provider}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{item.type}</div>
                                <div className="text-[10px] text-slate-400 select-all">{item.user}</div>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                             {item.busy ? (
                                 <div className="space-y-1">
                                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">Ocupado</span>
                                     <div className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]" title={item.userAssigned}>{item.userAssigned || "Sin Asignar"}</div>
                                 </div>
                             ) : (
                                 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase animate-pulse">Disponible</span>
                             )}
                        </td>

                        {/* Fecha Proveedor (Tú pagas) */}
                        <td className="px-6 py-4 text-center">
                            <div className={`flex flex-col items-center ${alertProvider ? 'animate-pulse' : ''}`}>
                                <span className={`text-xs font-bold ${alertProvider ? 'text-red-600' : 'text-slate-500'}`}>
                                    {formatDateToLocal(item.providerDueDate)}
                                </span>
                                {alertProvider && <span className="text-[9px] bg-red-600 text-white px-1.5 rounded uppercase font-black mt-1">¡PAGAR YA!</span>}
                            </div>
                        </td>

                        {/* Fecha Cliente (Él paga) */}
                        <td className="px-6 py-4 text-center">
                             {item.busy ? (
                                <div className="flex flex-col items-center">
                                    <span className={`text-xs font-bold ${alertClient ? 'text-amber-600' : 'text-slate-700'}`}>
                                        {formatDateToLocal(item.clientDueDate)}
                                    </span>
                                    {alertClient && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 rounded uppercase font-black mt-1">Cobrar</span>}
                                </div>
                             ) : (
                                 <span className="text-slate-300 text-xs">-</span>
                             )}
                        </td>

                        {/* Botones de Acción */}
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                {item.busy ? (
                                    <button onClick={() => handleRecycle(item)} className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all" title="Liberar perfil (Cliente no pagó)">
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5"/> Reciclar
                                    </button>
                                ) : (
                                    <button onClick={() => handleAssign(item)} className="flex items-center gap-1 bg-slate-900 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-md">
                                        <UserPlusIcon className="w-3.5 h-3.5"/> Vender
                                    </button>
                                )}
                                
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4"/></button>
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