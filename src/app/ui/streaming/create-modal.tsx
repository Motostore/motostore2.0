"use client";

import { useState } from "react";
import { PlusIcon, XMarkIcon, TvIcon, CalendarDaysIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function CreateAccountModal({ isOpen, onClose, onSave }: any) {
  if (!isOpen) return null;

  // Estado inicial con las DOS fechas independientes
  const [formData, setFormData] = useState({ 
    category: "Video", 
    provider: "Netflix", 
    type: "Perfil", 
    user: "", 
    key: "", 
    clientDueDate: "",   // Fecha corte Cliente
    providerDueDate: "", // Fecha corte Proveedor (Tu fecha)
    cost: "", 
    price: "" 
  });
  
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customProductName, setCustomProductName] = useState("");

  const renderProviderOptions = () => {
    let options: string[] = [];
    switch(formData.category) {
        case "Video": options = ["Netflix", "Disney+", "Max (HBO)", "Prime Video", "Paramount+", "Crunchyroll", "Plex"]; break;
        case "Musica": options = ["Spotify", "YouTube Music", "Apple Music", "Tidal"]; break;
        case "IPTV": options = ["Magis TV", "Tele Latino", "IPTV Smarters", "Flujo TV"]; break;
        default: options = [];
    }
    return (
        <>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="CUSTOM_NEW" className="font-bold text-red-600">➕ OTRO / NUEVO...</option>
        </>
    );
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === "CUSTOM_NEW") { setIsCustomProduct(true); setFormData({ ...formData, provider: "" }); } 
      else { setIsCustomProduct(false); setFormData({ ...formData, provider: val }); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProvider = isCustomProduct ? customProductName : formData.provider;
    
    // Validaciones estrictas
    if (!finalProvider) return alert("Escribe el nombre del producto.");
    if (!formData.user || !formData.key) return alert("Falta usuario o clave.");
    if (!formData.clientDueDate || !formData.providerDueDate) return alert("Debes definir AMBAS fechas de corte (Proveedor y Cliente).");

    onSave({ 
      id: Date.now(), 
      ...formData, 
      provider: finalProvider,
      cost: Number(formData.cost), 
      price: Number(formData.price), 
      busy: true, 
      status: true,
      // Mapeamos para compatibilidad: dueDate general será la del cliente
      dueDate: formData.clientDueDate, 
      clientDueDate: formData.clientDueDate,
      providerDueDate: formData.providerDueDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-100">
          <div>
            <h3 className="text-slate-900 font-black text-xl flex items-center gap-2 uppercase tracking-tight">
              <span className="p-2 bg-slate-900 rounded-lg text-white"><PlusIcon className="w-5 h-5"/></span> 
              Cargar al Almacén
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
            <XMarkIcon className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Selección de Producto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Producto</label>
                {isCustomProduct ? (
                    <div className="relative animate-in fade-in slide-in-from-left-2">
                        <input type="text" autoFocus placeholder="Ej: Star+ Premium" className="w-full p-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700 focus:outline-none focus:border-red-500" value={customProductName} onChange={(e) => setCustomProductName(e.target.value)} />
                        <button type="button" onClick={() => setIsCustomProduct(false)} className="absolute right-2 top-2 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 hover:text-red-600">Cancelar</button>
                    </div>
                ) : (
                    <div className="relative">
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-red-500 appearance-none" onChange={handleProviderChange} value={formData.provider}>
                            {renderProviderOptions()}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400"><TvIcon className="w-4 h-4"/></div>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Tipo</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-red-500" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Perfil">Perfil</option>
                    <option value="Cuenta Completa">Cuenta Completa</option>
                    <option value="Pantalla">Pantalla</option>
                    <option value="Código">Código</option>
                </select>
            </div>
          </div>

          {/* Credenciales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Usuario / Email</label>
                <input type="text" required placeholder="cliente@email.com" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500" value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})}/>
            </div>
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <input type="text" required placeholder="****" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-red-500" value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})}/>
            </div>
          </div>

          {/* 🔥 DOBLE FECHA DE CORTE (NUEVO) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wide">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-red-500"/> Corte Proveedor
                </label>
                <input type="date" required title="¿Cuándo debes pagar tú al proveedor?" className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-red-800 focus:outline-none focus:border-red-500 bg-white" value={formData.providerDueDate} onChange={(e) => setFormData({...formData, providerDueDate: e.target.value})}/>
                <span className="text-[9px] text-slate-400 mt-1 block">Tu fecha de pago.</span>
            </div>
            <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-slate-900 mb-1.5 uppercase tracking-wide">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-green-500"/> Corte Cliente
                </label>
                <input type="date" required title="¿Cuándo se le vence al cliente?" className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-green-500 bg-white" value={formData.clientDueDate} onChange={(e) => setFormData({...formData, clientDueDate: e.target.value})}/>
                <span className="text-[9px] text-slate-400 mt-1 block">Vencimiento del servicio.</span>
            </div>
          </div>

          {/* Finanzas */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>
            <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1"><BanknotesIcon className="w-3 h-3"/> Costo (Compra)</label>
                <div className="relative"><span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span><input type="number" step="0.01" className="w-full pl-6 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})}/></div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-green-600 mb-1 uppercase tracking-widest flex items-center gap-1"><BanknotesIcon className="w-3 h-3"/> Venta (Público)</label>
                <div className="relative"><span className="absolute left-3 top-2.5 text-green-600 font-bold text-xs">$</span><input type="number" step="0.01" className="w-full pl-6 p-2 bg-white border border-green-200 rounded-lg text-sm font-bold text-green-700 focus:outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}/></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-2">
             <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
             <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-[#E33127] rounded-xl shadow-lg transition-all transform active:scale-95">Guardar en Almacén</button>
          </div>
        </form>
      </div>
    </div>
  );
}