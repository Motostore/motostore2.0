'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  ShieldCheckIcon,
  CameraIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/solid'; 

// Importamos la lógica centralizada de roles
import { normalizeRole, roleLabel } from '@/app/lib/roles';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // --- 1. Extracción y Normalización de Datos ---
  const id = user?.id || user?.userId || '---';
  const name = user?.name || user?.username || 'Usuario';
  const dni = user?.dni || user?.cedula || user?.identification || 'No registrada';
  const email = user?.email || '---';
  const phone = user?.phone || user?.mobile || '---';
  const balance = typeof user?.balance === 'number' ? user?.balance : 0;
  
  // Normalización del Rol
  const rawRole = user?.role || user?.rol;
  const role = normalizeRole(rawRole);
  const displayRole = roleLabel[role];

  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-VE') : '---';
  const image = user?.image || null;

  // Datos del Distribuidor (Padre)
  const parentName = user?.parentName || 'Moto Store Soporte';
  const parentPhone = user?.parentPhone || '+58 412-0000000';
  const parentEmail = user?.parentEmail || 'soporte@motostorellc.com';

  // --- 2. Formateo de Dinero ---
  const formattedBalance = new Intl.NumberFormat('es-VE', { 
    style: 'currency', currency: 'USD' 
  }).format(balance);

  // --- 3. Componente de Fila (Reutilizable) ---
  const InfoRow = ({ icon, label, value, actionLink }: { icon?: any, label: string, value: string | React.ReactNode, actionLink?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-5 border-b border-slate-100 last:border-0 hover:bg-red-50/30 transition-colors px-4 -mx-4 rounded-xl group">
        <div className="flex items-center gap-3">
            {icon && <div className="p-2 bg-red-50 rounded-lg text-[#E33127] group-hover:bg-[#E33127] group-hover:text-white transition-colors">{icon}</div>}
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                <span className="font-bold text-base text-slate-800 break-all">{value}</span>
            </div>
        </div>
        
        {actionLink && (
            <Link 
                href={actionLink} 
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-[#E33127] transition-colors uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md"
            >
                Editar <PencilSquareIcon className="w-3 h-3"/>
            </Link>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER SUPERIOR */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-500 hover:text-[#E33127] shadow-sm hover:shadow-md transition-all mb-6">
           <ArrowLeftIcon className="w-3 h-3" /> Volver al Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden gap-6">
            <div className="flex items-center gap-5 relative z-10 w-full">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 shadow-inner">
                    <UserCircleIcon className="w-10 h-10 text-[#E33127]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Mi <span className="text-[#E33127]">Perfil</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
                        Información de Cuenta
                    </p>
                </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: TARJETA DE IDENTIDAD (4 columnas) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white p-8 flex flex-col items-center text-center relative overflow-hidden sticky top-6">
                
                {/* Fondo Decorativo ROJO */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#E33127] to-red-600"></div>
                
                {/* Avatar */}
                <div className="relative mt-10 mb-5 z-10">
                    <div className="w-36 h-36 rounded-full border-[6px] border-white shadow-2xl bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        {image ? (
                            <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-28 h-28 text-slate-300" />
                        )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2.5 bg-[#E33127] text-white rounded-full hover:bg-red-700 transition-all shadow-lg border-4 border-white active:scale-95" title="Cambiar foto">
                        <CameraIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Nombre y Rol */}
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{name}</h2>
                
                {/* Etiqueta de Rol Dinámica */}
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest mb-8 shadow-sm ${
                    role === 'SUPERUSER' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-red-50 text-[#E33127] border-red-100'
                }`}>
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    {displayRole}
                </span>

                {/* Saldo Estilo Tarjeta ROJA (MOTOSTORE) */}
                <div className="w-full bg-gradient-to-br from-[#E33127] to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-200 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all"></div>
                    
                    <div className="flex flex-col items-start relative z-10">
                        <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <BanknotesIcon className="w-4 h-4 text-white"/> Saldo Disponible
                        </span>
                        <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                            {formattedBalance}
                        </span>
                    </div>
                </div>

                {/* Estado de Cuenta */}
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Estado</span>
                        <span className="font-black text-emerald-600 text-sm">● ACTIVO</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Registro</span>
                        <span className="font-black text-slate-700 text-sm">{createdAt}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: DATOS DETALLADOS (8 columnas) */}
        <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-black text-sm uppercase text-slate-800 tracking-wider">Información Personal</h3>
                    <Link href="/dashboard/settings" className="text-xs font-bold text-[#E33127] bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors uppercase tracking-wide shadow-sm border border-red-100">
                        Editar Todo
                    </Link>
                </div>

                <div className="p-8">
                    <div className="flex flex-col space-y-1">
                        {/* DATOS PERSONALES */}
                        <InfoRow 
                            icon={<ShieldCheckIcon className="w-4 h-4"/>}
                            label="ID de Cliente" 
                            value={`#${id}`} 
                            // ID no se edita normalmente
                        />
                        
                        {/* ✅ AHORA SI: Documento con Link de Editar */}
                        <InfoRow 
                            icon={<IdentificationIcon className="w-4 h-4"/>}
                            label="Documento (DNI/Cédula)" 
                            value={dni} 
                            actionLink="/dashboard/settings?tab=profile" 
                        />

                        <InfoRow 
                            icon={<EnvelopeIcon className="w-4 h-4"/>}
                            label="Correo Electrónico" 
                            value={email} 
                            actionLink="/dashboard/settings?tab=email" 
                        />
                        <InfoRow 
                            icon={<PhoneIcon className="w-4 h-4"/>}
                            label="Teléfono Móvil" 
                            value={phone} 
                            actionLink="/dashboard/settings?tab=phone" 
                        />
                        
                        {/* SECCIÓN SOPORTE */}
                        <div className="pt-8 pb-4">
                             <h4 className="font-black text-xs uppercase text-slate-300 tracking-[0.2em] mb-2 border-b border-slate-100 pb-2">
                                Contacto de Soporte
                             </h4>
                        </div>

                        <InfoRow 
                            label="Distribuidor Asignado" 
                            value={parentName} 
                        />
                        <InfoRow 
                            label="Contacto Directo" 
                            value={`${parentPhone} • ${parentEmail}`} 
                        />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}