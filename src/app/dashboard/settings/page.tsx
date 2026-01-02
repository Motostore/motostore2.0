"use client";

import Link from "next/link";
import { 
  UserCircleIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";

export default function SettingsHubPage() {
  
  // Opciones del menú de configuración
  const settingsOptions = [
    {
      title: "Mi Perfil",
      description: "Visualiza tu información personal, ID de cliente y estado.",
      href: "/dashboard/profile",
      icon: UserCircleIcon,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      title: "Seguridad y Contraseña",
      description: "Actualiza tu clave de acceso y protege tu cuenta.",
      href: "/dashboard/settings/password",
      icon: KeyIcon,
      color: "text-[#E33127] bg-red-50 border-red-100"
    },
    // Aquí podemos agregar más módulos en el futuro (ej: Notificaciones, Pagos, etc.)
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-sm">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Configuración
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Gestiona tu cuenta y preferencias de seguridad.
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {settingsOptions.map((option) => (
                <Link 
                    key={option.href} 
                    href={option.href}
                    className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-5 relative overflow-hidden"
                >
                    {/* Icono */}
                    <div className={`p-4 rounded-2xl border ${option.color} shrink-0`}>
                        <option.icon className="w-8 h-8" />
                    </div>

                    {/* Texto */}
                    <div className="relative z-10">
                        <h3 className="font-black text-lg text-slate-900 group-hover:text-[#E33127] transition-colors">
                            {option.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                            {option.description}
                        </p>
                    </div>

                    {/* Flecha decorativa */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                    </div>
                </Link>
            ))}

        </div>
        
        {/* Footer Info */}
        <div className="mt-10 text-center">
            <p className="text-xs text-slate-400 font-medium">
                Moto Store LLC © 2025 • Panel de Control v2.0
            </p>
        </div>

      </div>
    </div>
  );
}







