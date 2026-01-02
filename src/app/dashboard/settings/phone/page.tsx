// src/app/dashboard/settings/phone/page.tsx (Página de Teléfono/SMS/WhatsApp - ULTRA PREMIUM FINAL)
import { PhoneIcon } from "@heroicons/react/24/outline";
import PhoneSettingsView from "./PhoneSettingsView"; // 🔥 FIX: Importando el componente real con la lógica

export const metadata = {
  title: "Teléfono y SMS/WhatsApp | Moto Store LLC",
  description: "Ajustes de seguridad y configuración de canales de comunicación por teléfono.",
};

export default function SettingsPhonePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 min-h-screen bg-slate-50">
        
      {/* HEADER DE LA PÁGINA */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black leading-none tracking-tight text-slate-900 flex items-center gap-2">
            <PhoneIcon className="w-8 h-8 text-[#E33127]" />
            Teléfono SMS y/o WhatsApp
        </h1>
        <p className="text-sm text-slate-600 mt-2">
            Gestione el número de contacto y elija los canales preferidos para notificaciones de seguridad.
        </p>
      </div>

      <div className="mt-6">
        {/* Usando el componente real con la lógica de verificación */}
        <PhoneSettingsView />
      </div>
    </div>
  );
}