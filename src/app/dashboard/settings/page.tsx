// src/app/dashboard/settings/page.tsx
import SettingsView from "./SettingsView";

export const metadata = {
  title: "Perfil | Moto Store LLC",
  description: "Ajustes de la cuenta del usuario",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
      <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
        Perfil
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        Gestiona los datos de tu cuenta, seguridad y preferencia de contacto.
      </p>

      <div className="mt-6">
        <SettingsView />
      </div>
    </div>
  );
}







