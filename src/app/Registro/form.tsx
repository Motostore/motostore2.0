'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react'; // Solo para social login, no para auto-login post-registro
import toast, { Toaster } from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  TagIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';

import { LocationSelectContext } from '../Context/locationSelectContext';
import { Animation } from '../components/InputErrors';
import { AuthResponse } from '../types/auth-response.interface';

// ---------- ICONOS SVG (GOOGLE / APPLE) ----------
const GoogleIcon = (
  <svg viewBox="0 0 48 48" className="h-5 w-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6 1.54 7.38 2.84l5.4-5.4C33.64 3.86 29.3 2 24 2 14.82 2 7.22 7.98 4.26 16.26l6.64 5.16C12.39 14.58 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.1-.41-4.5H24v9h12.7c-.55 2.9-2.23 5.36-4.74 7.02l7.64 5.93C43.9 37.9 46.5 31.7 46.5 24.5z" />
    <path fill="#FBBC05" d="M10.9 28.59A14.47 14.47 0 0 1 9.5 24c0-1.6.29-3.15.8-4.59l-6.64-5.16A22.4 22.4 0 0 0 2 24c0 3.62.87 7.03 2.41 10.04l6.49-5.45z" />
    <path fill="#34A853" d="M24 46c5.7 0 10.47-1.88 13.96-5.11l-7.64-5.93C28.3 36.26 26.3 37 24 37c-6.3 0-11.61-5.08-12.9-11.75l-6.64 5.16C7.22 40.02 14.82 46 24 46z" />
  </svg>
);

const AppleIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-black">
    <path d="M16.365 1.43c0 1.14-.417 2.09-1.243 2.86-.996.953-2.2 1.5-3.51 1.41-.06-1.11.435-2.08 1.26-2.84.96-.89 2.27-1.47 3.493-1.54.01.04.01.08.01.11zM20.53 17.26c-.49 1.13-.72 1.64-1.35 2.64-.88 1.37-2.12 3.08-3.67 3.09-1.36.01-1.71-.9-3.57-.89-1.86.01-2.25.9-3.61.89-1.55-.01-2.74-1.55-3.62-2.92-2.48-3.82-2.74-8.3-1.21-10.68 1.08-1.7 2.79-2.7 4.4-2.7 1.63 0 2.65.91 4.01.91 1.34 0 2.16-.91 4.03-.91 1.45 0 2.98.79 4.06 2.15-3.56 1.95-2.98 7.04.11 8.32z" />
  </svg>
);

// ---------- HELPERS & SCHEMA ---------- 
const norm = (s: string) => (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
type Opt = { value: string; name: string };
const dedupe = (arr: Opt[]) => Array.from(new Map(arr.map(o => [norm(o.value || o.name), o])).values());
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const schema = Yup.object({
  username: Yup.string().required('Requerido'),
  email: Yup.string().matches(emailRegex, 'Inválido').required('Requerido'),
  name: Yup.string().required('Requerido'),
  lastName: Yup.string().required('Requerido'),
  identificationCard: Yup.string().required('Requerido'),
  phone: Yup.string().required('Requerido'),
  country: Yup.string().notOneOf(['DISABLED', ''], 'Requerido').required('Requerido'),
  state: Yup.string().notOneOf(['DISABLED', ''], 'Requerido').required('Requerido'),
  city: Yup.string().notOneOf(['DISABLED', ''], 'Requerido').required('Requerido'),
  referredCode: Yup.string().nullable(),
  password: Yup.string().min(8, 'Mín. 8 caracteres').matches(/\d/, 'Debe incluir al menos un número').required('Requerido'),
  passwordConfirm: Yup.string().oneOf([Yup.ref('password')], 'No coinciden').required('Requerido'),
}).required();

// ---------- COMPONENTE FORMULARIO ---------- //

export default function RegisterForm() {
  const router = useRouter();
  const [revealPassword, setRevealPassword] = useState(false);

  const locationCtx = useContext(LocationSelectContext);
  if (!locationCtx) return <div className="p-4 text-red-500 text-sm">Cargando módulos de ubicación...</div>;

  const { countries, states, cities, getStates, getCities, loadingLocations } = locationCtx; 

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, resetField, watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { country: 'DISABLED', state: 'DISABLED', city: 'DISABLED' },
    mode: 'onBlur',
  });

  const country = watch('country');
  const state = watch('state');

  // Optimizaciones de UI para listas
  const countriesUI = useMemo(() => dedupe(countries).sort((a, b) => a.name.localeCompare(b.name)), [countries]);
  const statesUI = useMemo(() => dedupe(states).sort((a, b) => a.name.localeCompare(b.name)), [states]);
  const citiesUI = useMemo(() => dedupe(cities).sort((a, b) => a.name.localeCompare(b.name)), [cities]);

  useEffect(() => {
    if (country && country !== 'DISABLED') {
      getStates(country);
      resetField('state', { defaultValue: 'DISABLED' });
      resetField('city', { defaultValue: 'DISABLED' });
    }
  }, [country, getStates, resetField]);

  useEffect(() => {
    if (state && state !== 'DISABLED') {
      getCities(state);
      resetField('city', { defaultValue: 'DISABLED' });
    }
  }, [state, getCities, resetField]);

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Nota: El social login también debería verificar aprobación en el callback de NextAuth
    void signIn(provider, { callbackUrl: '/dashboard' });
  };

  const onSubmit = handleSubmit(async data => {
    if (data.country === 'DISABLED' || data.state === 'DISABLED' || data.city === 'DISABLED') {
      toast.error('Por favor completa tu ubicación');
      return;
    }
    
    const toastId = toast.loading('Procesando solicitud...');

    try {
      // 🔥 FIX CRÍTICO: URL directa al Backend en Render para evitar errores de Vercel
      const BACKEND_URL = "https://motostore-api.onrender.com";
      
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });

      const resp = await response.json() as AuthResponse;

      if (response.ok && !resp.error) {
        
        // --- SEGURIDAD PRO: NO LOGIN AUTOMÁTICO ---
        
        toast.success('¡Registro completado!', { id: toastId });
        
        // Mensaje de espera de aprobación
        toast('Tu cuenta está PENDIENTE DE APROBACIÓN. Te notificaremos cuando esté activa.', { 
            icon: '🔒', 
            duration: 6000,
            style: {
                borderRadius: '10px',
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155'
            },
        });

        // Redirigir al LOGIN, no al Dashboard
        setTimeout(() => {
            router.push('/login');
        }, 3000);

      } else {
        toast.error(resp.message || 'Error al registrar usuario', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con el servidor', { id: toastId });
    }
  });

  // ESTILOS PRO
  const inputGroupClass = "space-y-4";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1";
  const inputWrapperClass = "relative group";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127] transition-colors duration-300 z-10 w-5 h-5";
  const inputClass = "block w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E33127]/10 focus:border-[#E33127] transition-all duration-300 shadow-sm";
  const sectionTitleClass = "text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 mt-6 first:mt-0 flex items-center gap-2";

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="w-full animate-in fade-in duration-500">
      
      {/* 1. CREDENCIALES */}
      <div className={sectionTitleClass}>
        <UserIcon className="w-4 h-4 text-[#E33127]" />
        Datos de Cuenta
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
        <div className={inputGroupClass}>
          <div>
            <label className={labelClass}>Usuario</label>
            <div className={inputWrapperClass}>
              <UserIcon className={iconClass} />
              <input {...register('username')} type="text" placeholder="Ej. motolover99" className={inputClass} />
            </div>
            <Animation errors={errors} field="username" />
          </div>
        </div>
        <div className={inputGroupClass}>
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <div className={inputWrapperClass}>
              <EnvelopeIcon className={iconClass} />
              <input {...register('email')} type="email" placeholder="nombre@correo.com" className={inputClass} />
            </div>
            <Animation errors={errors} field="email" />
          </div>
        </div>
      </div>

      {/* 2. DATOS PERSONALES */}
      <div className={sectionTitleClass}>
        <IdentificationIcon className="w-4 h-4 text-[#E33127]" />
        Información Personal
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
        <div>
          <label className={labelClass}>Nombre</label>
          <input {...register('name')} type="text" placeholder="Tu nombre" className={`${inputClass} !pl-4`} />
          <Animation errors={errors} field="name" />
        </div>
        <div>
          <label className={labelClass}>Apellido</label>
          <input {...register('lastName')} type="text" placeholder="Tu apellido" className={`${inputClass} !pl-4`} />
          <Animation errors={errors} field="lastName" />
        </div>
        <div>
          <label className={labelClass}>Cédula / ID</label>
          <div className={inputWrapperClass}>
             <IdentificationIcon className={iconClass} />
             <input {...register('identificationCard')} placeholder="123456789" className={inputClass} />
          </div>
          <Animation errors={errors} field="identificationCard" />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <div className={inputWrapperClass}>
             <PhoneIcon className={iconClass} />
             <input {...register('phone')} type="tel" placeholder="+57 300..." className={inputClass} />
          </div>
          <Animation errors={errors} field="phone" />
        </div>
      </div>

      {/* 3. UBICACIÓN */}
      <div className={sectionTitleClass}>
        <MapPinIcon className="w-4 h-4 text-[#E33127]" />
        Ubicación
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* PAÍS */}
          <div className="relative w-full">
            <select {...register('country')} className={`${inputClass} !pl-4 appearance-none cursor-pointer`}>
              <option value="DISABLED" disabled>
                {loadingLocations && countriesUI.length === 0 ? "Cargando..." : "País"}
              </option>
              {countriesUI.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.name}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* ESTADO */}
          <div className="relative w-full">
            <select {...register('state')} disabled={!country || country === 'DISABLED'} className={`${inputClass} !pl-4 appearance-none cursor-pointer disabled:opacity-60`}>
              <option value="DISABLED" disabled>Estado</option>
              {statesUI.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.name}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* CIUDAD */}
          <div className="relative w-full">
            <select {...register('city')} disabled={!state || state === 'DISABLED'} className={`${inputClass} !pl-4 appearance-none cursor-pointer disabled:opacity-60`}>
              <option value="DISABLED" disabled>Ciudad</option>
              {citiesUI.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.name}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <Animation errors={errors} field="country" />
          <Animation errors={errors} field="state" />
          <Animation errors={errors} field="city" />
        </div>
      </div>

      {/* 4. SEGURIDAD */}
      <div className={sectionTitleClass}>
        <ShieldCheckIcon className="w-4 h-4 text-[#E33127]" />
        Seguridad
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
        <div>
          <label className={labelClass}>Contraseña</label>
          <div className={inputWrapperClass}>
            <input {...register('password')} type={revealPassword ? 'text' : 'password'} className={`${inputClass} !pl-4 pr-10`} placeholder="••••••••" />
            <button type="button" onClick={() => setRevealPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E33127] transition-colors">
              {revealPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <Animation errors={errors} field="password" />
        </div>
        <div>
          <label className={labelClass}>Confirmar</label>
          <input {...register('passwordConfirm')} type={revealPassword ? 'text' : 'password'} className={`${inputClass} !pl-4`} placeholder="••••••••" />
          <Animation errors={errors} field="passwordConfirm" />
        </div>
      </div>

      {/* 5. CÓDIGO REFERIDO */}
      <div className="mb-6">
         <label className={labelClass}>Código de Referido (Opcional)</label>
         <div className={inputWrapperClass}>
            <TagIcon className={iconClass} />
            <input {...register('referredCode')} type="text" placeholder="¿Alguien te invitó?" className={inputClass} />
         </div>
      </div>

      {/* 6. BOTONES ACCIÓN */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-slate-100">
        
        {/* BOTÓN CANCELAR */}
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="
            w-full sm:flex-1 py-3.5 rounded-xl
            bg-slate-100 text-slate-600 font-bold text-sm
            hover:bg-slate-200 transition-all
            flex items-center justify-center gap-2
          "
        >
          Cancelar
        </button>

        {/* BOTÓN REGISTRAR */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full sm:flex-1 py-3.5 rounded-xl
            bg-[#E33127] hover:bg-[#c92a21] text-white font-bold text-sm
            shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5
            transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? 'Procesando...' : (
            <>
              Registrarme <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* 7. SOCIAL LOGIN */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">O regístrate con</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 hover:bg-slate-50 transition-all hover:border-slate-300">
          {GoogleIcon} <span className="text-sm font-bold text-slate-700">Google</span>
        </button>
        <button type="button" onClick={() => handleSocialLogin('apple')} className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 hover:bg-slate-50 transition-all hover:border-slate-300">
          {AppleIcon} <span className="text-sm font-bold text-slate-700">Apple</span>
        </button>
      </div>

      <Toaster toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }} />
    </form>
  );
}






