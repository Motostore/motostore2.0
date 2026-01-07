'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Importamos las acciones del servidor (El Túnel)
import { updateProfileServer, changePasswordServer } from '@/app/actions/profile.actions';

import { 
  ArrowLeftIcon, 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

export default function SettingsPage() {
  const { data: session, update } = useSession(); 
  const user = session?.user as any;
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const activeTab = searchParams.get('tab') || 'profile'; 
  const [tab, setTab] = useState(activeTab);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error' | null, text: string}>({ type: null, text: '' });

  const [formData, setFormData] = useState({
    name: '',
    dni: '', 
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        dni: user.cedula || user.dni || '',
        email: user.email || '',
        phone: user.phone || user.telefono || '',
      }));
    }
  }, [session]);

  const changeTab = (newTab: string) => {
    setTab(newTab);
    setStatusMsg({ type: null, text: '' });
    router.push(`/dashboard/settings?tab=${newTab}`, { scroll: false });
  };

  const handleInput = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------------------------------------------------
  // 🚀 LÓGICA DE GUARDADO (USANDO EL TÚNEL SERVER ACTION)
  // ---------------------------------------------------------

  const handleUpdateProfile = async (fieldToUpdate: 'basic_info' | 'email' | 'phone') => {
    setIsLoading(true);
    setStatusMsg({ type: null, text: '' });

    try {
      const dataToSend: any = {};
      
      if (fieldToUpdate === 'basic_info') {
          dataToSend.name = formData.name;
          dataToSend.cedula = formData.dni;
      }
      if (fieldToUpdate === 'email') dataToSend.email = formData.email;
      if (fieldToUpdate === 'phone') dataToSend.phone = formData.phone;

      // Obtenemos token
      const token = user?.accessToken || user?.token;
      if (!token) throw new Error("No hay sesión activa. Recarga la página.");

      // 👇👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇👇
      // Agregamos 'user' como 4to argumento. 
      // Le pasamos al servidor nuestra copia local para que no tenga que buscarla (y fallar).
      const response = await updateProfileServer(token, user.id, dataToSend, user);

      if (!response.success) {
        throw new Error(response.error || "Error al actualizar");
      }

      // Si el servidor dijo OK, actualizamos la vista local
      await update(dataToSend);
      setStatusMsg({ type: 'success', text: 'Datos actualizados correctamente.' });

    } catch (error: any) {
      setStatusMsg({ type: 'error', text: error.message || 'Error al actualizar.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    setStatusMsg({ type: null, text: '' });

    if (!formData.currentPassword || !formData.newPassword) {
      setStatusMsg({ type: 'error', text: 'Debes llenar ambos campos.' });
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      };

      const token = user?.accessToken || user?.token;
      if (!token) throw new Error("No hay sesión activa.");

      const response = await changePasswordServer(token, user.id, payload);

      if (!response.success) {
        throw new Error(response.error || "Error al cambiar contraseña");
      }

      setStatusMsg({ type: 'success', text: 'Contraseña cambiada con éxito.' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));

    } catch (error: any) {
      setStatusMsg({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // RENDERIZADO (UI)
  // ---------------------------------------------------------

  const tabs = [
    { id: 'profile', label: 'Datos Básicos', icon: UserCircleIcon, desc: 'Nombre y Cédula' },
    { id: 'email', label: 'Correo', icon: EnvelopeIcon, desc: 'Actualizar email' },
    { id: 'phone', label: 'Teléfono', icon: PhoneIcon, desc: 'Contacto móvil' },
    { id: 'security', label: 'Seguridad', icon: LockClosedIcon, desc: 'Contraseña' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 p-4 md:p-8">
      
      {/* HEADER & VOLVER */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-500 hover:text-[#E33127] shadow-sm hover:shadow-md transition-all mb-6">
           <ArrowLeftIcon className="w-3 h-3" /> Volver al Perfil
        </Link>

        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
                 <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                    Configuración <span className="text-[#E33127]">General</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Gestiona tu cuenta y seguridad
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Opciones</span>
            
            {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => changeTab(item.id)}
                        className={`group flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all ${
                            isActive 
                            ? 'bg-white shadow-lg shadow-slate-200 border border-slate-100' 
                            : 'hover:bg-white hover:shadow-md border border-transparent'
                        }`}
                    >
                        <div className={`p-2 rounded-xl shrink-0 transition-colors ${isActive ? 'bg-[#E33127] text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-red-50 group-hover:text-[#E33127]'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className={`block text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{item.label}</span>
                            <span className="block text-[10px] font-medium text-slate-400">{item.desc}</span>
                        </div>
                    </button>
                );
            })}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-8 md:p-10 relative">
            
            {/* ALERTAS */}
            {statusMsg.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-pulse ${
                    statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {statusMsg.type === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : <ExclamationCircleIcon className="w-5 h-5"/>}
                    <span className="text-sm font-bold">{statusMsg.text}</span>
                </div>
            )}
            
            {/* PESTAÑA: DATOS BÁSICOS */}
            {tab === 'profile' && (
                <div className="space-y-8 animate-fadeIn">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Datos Básicos</h2>
                        <p className="text-sm text-slate-500 font-medium">Información visible en tu perfil.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4"/> Nombre Completo
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInput}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                <IdentificationIcon className="w-4 h-4"/> Cédula / DNI
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="dni" 
                                    value={formData.dni}
                                    onChange={handleInput}
                                    placeholder="V-00000000"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold ml-2">
                                ℹ️ Asegúrate de que tu documento sea correcto.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => handleUpdateProfile('basic_info')} 
                            disabled={isLoading}
                            className={`px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs hover:bg-[#E33127] transition-all shadow-lg hover:shadow-red-200 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}

            {/* PESTAÑA: CORREO */}
            {tab === 'email' && (
                <div className="space-y-8 animate-fadeIn">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Correo Electrónico</h2>
                        <p className="text-sm text-slate-500 font-medium">Recibirás notificaciones en esta dirección.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Nuevo Correo</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInput}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                        />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => handleUpdateProfile('email')}
                            disabled={isLoading}
                            className={`px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs hover:bg-[#E33127] transition-all shadow-lg ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Validando...' : 'Validar y Actualizar'}
                        </button>
                    </div>
                </div>
            )}

            {/* PESTAÑA: TELEFONO */}
            {tab === 'phone' && (
                <div className="space-y-8 animate-fadeIn">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Teléfono Móvil</h2>
                        <p className="text-sm text-slate-500 font-medium">Para contacto directo y seguridad.</p>
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Número Telefónico</label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInput}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                        />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => handleUpdateProfile('phone')}
                            disabled={isLoading}
                            className={`px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs hover:bg-[#E33127] transition-all shadow-lg ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Número'}
                        </button>
                    </div>
                </div>
            )}

            {/* PESTAÑA: SEGURIDAD */}
            {tab === 'security' && (
                <div className="space-y-8 animate-fadeIn">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Cambiar Contraseña</h2>
                        <p className="text-sm text-slate-500 font-medium">Protege tu cuenta con una clave segura.</p>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Contraseña Actual</label>
                            <input 
                                type="password" 
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInput}
                                placeholder="••••••••" 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInput}
                                placeholder="••••••••" 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#E33127] focus:bg-white transition-all" 
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className={`px-8 py-4 bg-[#E33127] text-white rounded-2xl font-bold uppercase text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Procesando...' : 'Actualizar Clave'}
                        </button>
                    </div>
                </div>
            )}

            {/* MARCA DE AGUA */}
            <div className="absolute bottom-4 right-6 opacity-10 pointer-events-none">
                <ShieldCheckIcon className="w-32 h-32 text-slate-300"/>
            </div>

        </div>
      </div>
    </div>
  );
}





