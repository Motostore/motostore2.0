'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import {
  LinkIcon,
  UserIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  QrCodeIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";

// Helper para obtener URL base
function publicBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export default function UsersRegisterUrlPage() {
  const { data: session, status } = useSession();
  
  // Estado
  const [referralCode, setReferralCode] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Al cargar, generamos TU código único y TU enlace automáticamente
  useEffect(() => {
    if (session?.user?.name) {
      // Generamos un código "único" basado en el nombre del usuario para que se sienta personalizado
      const baseCode = session.user.name.substring(0, 4).toUpperCase();
      const uniqueSuffix = session.user.email ? session.user.email.length.toString() : 'X';
      // Código fijo simulado (en producción vendría de la BD)
      const code = `${baseCode}-${uniqueSuffix}${new Date().getDate()}`; 
      
      setReferralCode(code);
      
      // Generamos el link automáticamente SOLO para el rol CLIENTE
      const baseUrl = publicBase();
      const url = `${baseUrl}/Registro?ref=${code}&role=client`;
      setGeneratedLink(url);
    }
  }, [session]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("¡Copiado al portapapeles!", {
        icon: '📋',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  if (status === 'loading') return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando tu enlace...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <LinkIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Tu Enlace de Referido
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                    Comparte este enlace para registrar nuevos clientes bajo tu red.
                </p>
            </div>
        </div>
        <Link href="/dashboard/users/list" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-sm shadow-sm">
            <ArrowLeftIcon className="w-4 h-4" /> Volver al listado
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQ: INFO Y ROL (Solo Informativo) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheckIcon className="w-5 h-5 text-[#E33127]"/> Configuración Fija
                </h3>
                
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rol a Asignar</label>
                        <div className="flex items-center gap-2 text-slate-700 font-black">
                            <UserPlusIcon className="w-5 h-5 text-[#E33127]"/>
                            CLIENTE (Invitado)
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Todos los usuarios registrados con tu enlace iniciarán como <b>Clientes</b> y requerirán tu aprobación o gestión manual para cambiar de rol.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tu Identificador</label>
                        <div className="flex items-center gap-2 text-slate-700 font-mono font-bold text-lg">
                            <UserIcon className="w-5 h-5 text-[#E33127]"/>
                            {referralCode || 'Cargando...'}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Este código se incrusta automáticamente en el enlace para asignar los usuarios a tu cuenta.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DER: LOS ENLACES (Main) */}
        <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
                
                {/* Decoración de fondo sutil */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-red-50 rounded-full shadow-sm mb-4 text-[#E33127] border border-red-100">
                            <QrCodeIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">¡Todo Listo!</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                            Usa cualquiera de las siguientes opciones para invitar usuarios a <b>Moto Store LLC</b>.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* OPCIÓN 1: LINK WEB */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#E33127]/30 transition-colors group shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#E33127] rounded-lg">
                                    <GlobeAltIcon className="w-5 h-5 text-white"/>
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide text-slate-700">Enlace de Registro Web</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-50 rounded-xl p-3 font-mono text-xs md:text-sm text-slate-600 truncate border border-slate-200 group-hover:border-red-200 transition-all select-all">
                                    {generatedLink || 'Generando enlace...'}
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(generatedLink)}
                                    className="px-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-[#E33127] hover:text-white hover:border-[#E33127] transition-all shadow-sm flex items-center gap-2"
                                >
                                    <ClipboardDocumentIcon className="w-5 h-5" /> <span className="hidden sm:inline">Copiar</span>
                                </button>
                            </div>
                        </div>

                        {/* OPCIÓN 2: CÓDIGO APP */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#E33127]/30 transition-colors group shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#E33127] rounded-lg">
                                    <DevicePhoneMobileIcon className="w-5 h-5 text-white"/>
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide text-slate-700">Código para la App Móvil</span>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200 group-hover:border-red-200 transition-all border-dashed">
                                <span className="font-mono font-black text-2xl text-slate-800 tracking-[0.2em] pl-2 select-all">
                                    {referralCode || '...'}
                                </span>
                                <button 
                                    onClick={() => copyToClipboard(referralCode)}
                                    className="text-xs font-bold text-[#E33127] hover:underline mr-2"
                                >
                                    Copiar Código
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                    <CheckBadgeIcon className="w-4 h-4"/>
                    Los usuarios registrados quedarán vinculados a tu cuenta automáticamente.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}