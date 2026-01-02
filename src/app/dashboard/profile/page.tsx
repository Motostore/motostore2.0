'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  ShieldCheckIcon,
  CameraIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { normalizeRole, roleLabel } from '@/app/lib/roles';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // --- 1. Extracción de Datos (Safe Fallbacks) ---
  const id = user?.id || user?.userId || '---';
  const name = user?.name || user?.username || 'Usuario';
  const dni = user?.dni || user?.cedula || user?.identification || 'No registrada';
  const email = user?.email || '---';
  const phone = user?.phone || user?.mobile || '---';
  const balance = typeof user?.balance === 'number' ? user?.balance : 0;
  const role = normalizeRole(user?.role || user?.rol);
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-VE') : '---';
  const image = user?.image || null;

  // Datos del Distribuidor (Simulados si no vienen en sesión)
  const parentName = user?.parentName || 'Administrador Principal';
  const parentPhone = user?.parentPhone || '0412-0000000';
  const parentEmail = user?.parentEmail || 'soporte@motostore.com';

  // --- 2. Formateo de Dinero ---
  const formattedBalance = new Intl.NumberFormat('es-VE', { 
    style: 'currency', currency: 'USD' 
  }).format(balance);

  // --- 3. Componente de Fila (Row) ---
  const InfoRow = ({ label, value, actionLink }: { label: string, value: string | React.ReactNode, actionLink?: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-4 border-b border-slate-50 last:border-0 items-center">
        <dt className="font-bold text-slate-500 text-sm">{label}:</dt>
        <dd className="md:col-span-2 flex items-center justify-between gap-4">
            <span className="font-bold text-slate-800 text-base break-all">{value}</span>
            {actionLink && (
                <Link 
                    href={actionLink} 
                    className="shrink-0 px-3 py-1 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold hover:bg-sky-100 transition-colors border border-sky-100"
                >
                    Cambiar
                </Link>
            )}
        </dd>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                <UserCircleIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Mi <span className="text-[#E33127]">Perfil</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Gestión de datos personales y cuenta.
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: TARJETA VISUAL (4 columnas) */}
        <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden sticky top-6">
                <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-br from-[#E33127] to-red-700"></div>
                
                {/* Avatar */}
                <div className="relative mt-8 mb-4 z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                        {image ? (
                            <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-24 h-24 text-slate-300" />
                        )}
                    </div>
                    <button className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full hover:bg-black transition-colors shadow-lg border-2 border-white" title="Cambiar foto">
                        <CameraIcon className="w-4 h-4" />
                    </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-1">{name}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-50 text-slate-600 border-slate-200 uppercase tracking-wider mb-6">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    {roleLabel[role] || role}
                </span>

                {/* Resumen Rápido */}
                <div className="w-full grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Estado</span>
                        <span className="block font-black text-emerald-600">Activo</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Miembros</span>
                        <span className="block font-black text-slate-800">--</span>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: LISTA DETALLADA (8 columnas) - TIPO IMAGEN */}
        <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-lg text-slate-800">Información de Cuenta</h3>
                    <Link href="/dashboard/settings" className="text-sm font-bold text-[#E33127] hover:underline flex items-center gap-1">
                        <PencilSquareIcon className="w-4 h-4" /> Editar todo
                    </Link>
                </div>

                <div className="p-8">
                    <dl className="flex flex-col">
                        {/* DATOS PERSONALES */}
                        <InfoRow label="Id cliente" value={`#${id}`} />
                        <InfoRow label="Nombre" value={name} />
                        <InfoRow label="Cédula" value={dni} />
                        <InfoRow label="Correo" value={email} actionLink="/dashboard/settings?tab=email" />
                        <InfoRow label="Teléfono" value={phone} actionLink="/dashboard/settings?tab=phone" />
                        
                        {/* DATOS FINANCIEROS */}
                        <div className="my-2 border-t border-slate-100"></div>
                        <InfoRow label="Saldo" value={<span className="text-emerald-600 font-black text-lg">{formattedBalance}</span>} />
                        <InfoRow label="Tipo de cuenta" value={roleLabel[role]} />
                        <InfoRow label="Fecha de registro" value={createdAt} />

                        {/* DATOS DISTRIBUIDOR */}
                        <div className="my-2 border-t border-slate-100"></div>
                        <InfoRow label="Distribuidor" value={parentName} actionLink="/dashboard/settings?tab=distributor" />
                        <InfoRow label="Telf Distribuidor" value={parentPhone} />
                        <InfoRow label="Correo Distribuidor" value={parentEmail} />
                    </dl>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}