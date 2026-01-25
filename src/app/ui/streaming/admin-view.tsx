"use client";

import { ShieldCheckIcon, PlayCircleIcon, MusicalNoteIcon, TvIcon, UserIcon, KeyIcon, ClockIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { formatDateToLocal } from "@/app/lib/utils";
import SecretVault from "@/app/ui/streaming/secret-vault";

const getCategoryIcon = (cat?: string | null) => {
  if (cat === "Musica") return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
  if (cat === "IPTV") return <TvIcon className="w-5 h-5 text-orange-500" />;
  return <PlayCircleIcon className="w-5 h-5 text-red-500" />;
};

export default function ClientView({ items, loading }: any) {
  if (loading) return <div className="text-center py-20 font-bold text-slate-400">Cargando tus servicios...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Cliente */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Mis <span className="text-red-600">Suscripciones</span></h1>
            <p className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1"><ShieldCheckIcon className="w-4 h-4 text-slate-400"/> Acceso seguro a tus cuentas</p>
        </div>
        <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-600">
            Activas: <span className="text-red-600 text-base ml-1">{items.length}</span>
        </div>
      </div>

      {/* ESTADO VACÍO */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <ShoppingBagIcon className="w-16 h-16 text-slate-300 mb-4"/>
            <h3 className="text-lg font-bold text-slate-500">No tienes suscripciones activas</h3>
            <p className="text-sm text-slate-400">Ve a la Tienda para adquirir servicios.</p>
        </div>
      )}

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-100 transition-all duration-300 relative overflow-hidden">
            {/* Barra de estado visual */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${item.busy ? 'bg-green-500' : 'bg-slate-200'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 text-red-600">{getCategoryIcon(item.category)}</div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.busy ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {item.busy ? 'Activo' : 'Expirado'}
                </span>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{item.provider}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: #{item.id} • {item.type}</p>
            </div>

            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
              <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider"><UserIcon className="w-3 h-3"/> Usuario</div>
                  <SecretVault text={item.user || ""} isCopy />
              </div>
              <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider"><KeyIcon className="w-3 h-3"/> Contraseña</div>
                  <SecretVault text={item.key || ""} isCopy />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <ClockIcon className="w-4 h-4 text-slate-300"/> 
                    Vence: 
                    {/* Solo mostramos clientDueDate o dueDate, NUNCA providerDueDate */}
                    <span className="text-slate-900 font-bold">{formatDateToLocal(item.clientDueDate || item.dueDate)}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}