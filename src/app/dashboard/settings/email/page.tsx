// src/app/dashboard/settings/email/page.tsx (CORREGIDO - Importando el componente real)
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import EmailSettingsView from "./EmailSettingsView"; // 🔥 FIX: Importación del componente real

export const metadata = {
  title: "Correo Electrónico | Moto Store LLC",
  description: "Ajustes de seguridad y gestión del correo electrónico de la cuenta.",
};

export default function SettingsEmailPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 min-h-screen bg-slate-50">
        
      {/* HEADER DE LA PÁGINA */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black leading-none tracking-tight text-slate-900 flex items-center gap-2">
            <EnvelopeIcon className="w-8 h-8 text-[#E33127]" />
            Correo Electrónico
        </h1>
        <p className="text-sm text-slate-600 mt-2">
            Gestione la dirección de correo electrónico principal asociada a esta cuenta.
        </p>
      </div>

      <div className="mt-6">
        {/* FIX: Usando el componente real con la lógica de verificación */}
        <EmailSettingsView />
      </div>
    </div>
  );
}