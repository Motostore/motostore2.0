"use client";

import { useState } from "react";
import { PlusIcon, XMarkIcon, TvIcon, CalendarDaysIcon, BanknotesIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function CreateAccountModal({ isOpen, onClose, onSave }: any) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({ 
    category: "Video", 
    provider: "Netflix", 
    type: "Perfil", // Puede ser Perfil o Cuenta Completa
    user: "", 
    key: "", 
    providerDueDate: "", // Fecha corte Proveedor
    cost: "", 
    price: "" 
  });
  
  // 🔥 NUEVO: Cantidad de perfiles a generar automáticamente
  const [profilesCount, setProfilesCount] = useState(1);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalProvider = isCustomProduct ? customProductName : formData.provider;
    
    if (!finalProvider) return alert("Escribe el nombre del producto.");
    if (!formData.user || !formData.key) return alert("Falta usuario o clave.");
    if (!formData.providerDueDate) return alert("Falta la fecha de corte del proveedor.");

    // 🔥 MAGIA: CREAMOS MÚLTIPLES PERFILES AUTOMÁTICAMENTE
    // Si seleccionas "Cuenta Completa", count es 1. Si es "Perfil", usamos el número.
    const loopCount = formData.type === "Cuenta Completa" ? 1 : profilesCount;

    for (let i = 1; i <= loopCount; i++) {
        await onSave({ 
          id: Date.now() + i, // ID único para cada uno
          ...formData, 
          provider: finalProvider,
          // Si son perfiles, le agregamos el número al tipo (ej: Perfil #1)
          type: loopCount > 1 ? `Perfil #${i}` : formData.type,
          cost: Number(formData.cost), 
          price: Number(formData.price), 
          
          // ESTADO INICIAL: DISPONIBLE PARA VENDER
          busy: false, 
          status: true,
          
          // El cliente está vacío al principio
          userAssigned: null, 
          clientDueDate: null, 
          
          // La fecha del proveedor sí va fija
          providerDueDate: formData.providerDueDate
        });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-black text-lg flex items-center gap-2 uppercase tracking-wide">
              <PlusIcon className="w-5 h-5 text-red-500"/> Cargar Inventario
            </h3>
            <p className="text-slate-400 text-xs">Ingresa la cuenta madre y dividiremos los perfiles.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-red-600 transition-all">
            <XMarkIcon className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Fila 1: Producto y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase">Producto</label>
                {isCustomProduct ? (
                    <div className="relative">
                        <input type="text" autoFocus placeholder="Ej: Star+" className="w-full p-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700" value={customProductName} onChange={(e) => setCustomProductName(e.target.value)} />
                        <button type="button" onClick={() => setIsCustomProduct(false)} className="absolute right-2 top-2 text-[10px] text-red-600 underline">Volver</button>
                    </div>
                ) : (
                    <div className="relative">
                        <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none" onChange={handleProviderChange} value={formData.provider}>
                            {renderProviderOptions()}
                        </select>
                        <TvIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none"/>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase">Formato</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Perfil">Perfiles (Pantallas)</option>
                    <option value="Cuenta Completa">Cuenta Completa</option>
                    <option value="Código">Código / Key</option>
                </select>
            </div>
          </div>

          {/* Fila 2: Credenciales MADRE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase">Usuario Madre</label>
                <input type="text" required placeholder="cuenta@netflix.com" className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold" value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})}/>
            </div>
            <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase">Contraseña</label>
                <input type="text" required placeholder="password123" className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono" value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})}/>
            </div>
          </div>

          {/* Fila 3: Cantidad de Perfiles y Vencimiento Proveedor */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
             {/* CANTIDAD AUTOMÁTICA */}
             <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 mb-1.5 uppercase">
                    <UserGroupIcon className="w-3.5 h-3.5 text-blue-500"/> Cantidad Perfiles
                </label>
                {formData.type === "Cuenta Completa" ? (
                    <input type="text" disabled value="1 (Único)" className="w-full p-2 border border-slate-200 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold"/>
                ) : (
                    <input type="number" min="1" max="10" className="w-full p-2 border border-blue-200 bg-white text-blue-700 rounded-lg text-sm font-black focus:ring-2 focus:ring-blue-500" value={profilesCount} onChange={(e) => setProfilesCount(Number(e.target.value))}/>
                )}
                <span className="text-[9px] text-slate-400 mt-1 block">Se crearán {formData.type === "Cuenta Completa" ? 1 : profilesCount} espacios.</span>
            </div>

            {/* FECHA PROVEEDOR (IMPORTANTE PARA TU AVISO DE 5 DÍAS) */}
            <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 mb-1.5 uppercase">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-red-500"/> Corte Proveedor
                </label>
                <input type="date" required className="w-full p-2 border border-red-200 rounded-lg text-xs font-bold text-red-800 bg-white" value={formData.providerDueDate} onChange={(e) => setFormData({...formData, providerDueDate: e.target.value})}/>
                <span className="text-[9px] text-slate-400 mt-1 block">Te avisaremos 5 días antes.</span>
            </div>
          </div>

          {/* Finanzas */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase"><BanknotesIcon className="w-3 h-3 inline mr-1"/>Costo (Unitario)</label>
                <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Lo que te cuesta c/u" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})}/>
            </div>
            <div>
                <label className="block text-[10px] font-black text-green-600 mb-1 uppercase"><BanknotesIcon className="w-3 h-3 inline mr-1"/>Venta (Público)</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-green-200 rounded-lg text-sm font-bold text-green-700" placeholder="Precio final" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}/>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
             <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-[#E33127] rounded-xl shadow-lg transition-all active:scale-95">
                Generar {formData.type === "Cuenta Completa" ? "Cuenta" : `${profilesCount} Perfiles`}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}