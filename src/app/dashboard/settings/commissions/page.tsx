import { WrenchScrewdriverIcon, BanknotesIcon } from "@heroicons/react/24/outline";
// ✅ Importación correcta: Asumimos que ambos archivos están en la carpeta 'commissions'
import CommissionManagementView from "./CommissionManagementView"; 

export const metadata = {
  title: "Comisiones | Moto Store LLC",
  description: "Configuración unificada de márgenes para Legion SMM, Danlipagos y Recargas.",
};

export default function SettingsCommissionsPage() {
  return (
    // Contenedor base con fondo gris suave
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 min-h-screen bg-slate-50 animate-in fade-in duration-500">
        
      {/* --- HEADER PREMIUM --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Ícono con fondo suave para destacar */}
            <div className="p-2.5 bg-red-50 rounded-xl shadow-sm border border-red-100">
                <WrenchScrewdriverIcon className="w-7 h-7 text-[#E33127]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Comisiones
            </h1>
          </div>
          <p className="text-slate-500 text-lg max-w-3xl ml-1">
              Centro de control financiero. Define tus márgenes de ganancia para servicios de Streaming, Redes Sociales y Recargas.
          </p>
        </div>

        {/* Badge Informativo */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-bold shadow-sm select-none">
            <BanknotesIcon className="w-4 h-4" />
            <span>Módulo Financiero</span>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* 🔥 AJUSTE: Eliminamos el 'bg-white' y bordes de aquí porque el componente hijo ya los trae. */}
      {/* Dejamos solo el margen superior para separar del header. */}
      <main className="mt-6">
        <CommissionManagementView />
      </main>
      
    </div>
  );
}