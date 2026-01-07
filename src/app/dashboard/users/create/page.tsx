'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  creatableRolesFor,
  normalizeRole,
  roleLabel,
  Role,
} from "@/app/lib/roles";
import {
  UserPlusIcon,
  ArrowLeftIcon,
  UserIcon,
  AtSymbolIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldExclamationIcon,
  CheckBadgeIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

/* ================= Configuración ================= */
const API_BASE_RENDER = "https://motostore-api.onrender.com/api/v1";

function pickToken(s: any): string | null {
  return s?.accessToken || s?.user?.accessToken || s?.user?.token || null;
}

type FormState = {
  name: string;
  username: string;
  email: string;
  phone: string;
  cedula: string;
  role: Role;
  password: string;
  confirm: string;
  active: boolean;
};

const DEFAULTS: FormState = {
  name: "",
  username: "",
  email: "",
  phone: "",
  cedula: "",
  role: "CLIENT",
  password: "",
  confirm: "",
  active: true, 
};

export default function UsersCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = useMemo(() => pickToken(session), [session]);
  
  const currentRole = useMemo(
    () => normalizeRole((session?.user as any)?.role),
    [session]
  );

  const roleOptions = useMemo(
    () => creatableRolesFor(currentRole),
    [currentRole]
  );

  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULTS,
    role: roleOptions.includes("CLIENT") ? "CLIENT" : (roleOptions[0] ?? "CLIENT"),
  }));

  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Validaciones
    if (form.password !== form.confirm) return toast.error("Las contraseñas no coinciden");
    if (form.password.length < 6) return toast.error("La contraseña es muy corta (mín. 6)");
    if (!form.cedula) return toast.error("La Cédula/ID es obligatoria");
    if (!token) return toast.error("Tu sesión ha expirado. Por favor, reingresa.");

    setLoading(true);
    const toastId = toast.loading("Registrando usuario...");
    
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        cedula: form.cedula.trim(),
        telefono: form.phone.trim(),
        full_name: form.name.trim(),
        role: normalizeRole(form.role),
        disabled: !form.active 
      };

      const res = await fetch(`${API_BASE_RENDER}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      if (res.ok) {
        toast.success(`Usuario ${form.username} creado correctamente`, { id: toastId });
        setTimeout(() => router.push("/dashboard/users/list"), 1000);
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al crear el usuario");
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast.error(e.message, { id: toastId });
      }
    } finally {
      if (abortRef.current && !abortRef.current.signal.aborted) {
         setLoading(false);
      }
    }
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (status === 'authenticated' && !roleOptions.length) {
    return (
      <div className="min-h-screen p-6 bg-slate-50 flex items-center justify-center animate-fadeIn">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
          <ShieldExclamationIcon className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-black text-slate-900 mb-2 uppercase">Acceso Restringido</h1>
          <p className="text-slate-500 text-sm mb-6">Tu nivel de usuario ({currentRole}) no tiene permisos para crear nuevas cuentas.</p>
          <Link href="/dashboard/users/list" className="text-[#E33127] font-bold text-sm hover:underline">Volver al listado</Link>
        </div>
      </div>
    );
  }

  if (status === 'loading') return <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Cargando permisos...</div>;

  // CLASES OPTIMIZADAS (Más compactas y elegantes)
  const ICON_CLASS = "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127] transition-colors";
  const INPUT_CLASS = "w-full py-2.5 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:border-[#E33127] focus:ring-2 focus:ring-[#E33127]/10 outline-none transition-all placeholder:text-slate-400";
  const LABEL_CLASS = "block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-wide";

  return (
    // CAMBIO CLAVE: max-w-3xl para que no se vea "tan grande" en escritorio
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fadeIn">
      <Toaster position="top-right" />
      
      {/* HEADER COMPACTO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                    <UserPlusIcon className="w-6 h-6 text-[#E33127]" />
                </div>
                Crear Nuevo Usuario
            </h1>
            <p className="text-slate-500 text-xs mt-1 ml-11">Añade un nuevo miembro al sistema manualmente.</p>
        </div>
        <Link 
            href="/dashboard/users/list" 
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:border-[#E33127] hover:text-[#E33127] transition-all shadow-sm"
        >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver
        </Link>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-5 md:p-8 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 space-y-6">
          
          {/* SECCIÓN 1: DATOS BÁSICOS */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#E33127]"/> Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Nombre Completo</label>
                  <div className="relative group">
                      <UserIcon className={ICON_CLASS} />
                      <input className={INPUT_CLASS} value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Ej. Juan Pérez" required />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Cédula / ID</label>
                  <div className="relative group">
                      <IdentificationIcon className={ICON_CLASS} />
                      <input className={INPUT_CLASS} value={form.cedula} onChange={(e) => onChange("cedula", e.target.value)} placeholder="V-12345678" required />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Usuario (Login)</label>
                  <div className="relative group">
                      <AtSymbolIcon className={ICON_CLASS} />
                      <input className={INPUT_CLASS} value={form.username} onChange={(e) => onChange("username", e.target.value)} placeholder="Ej. juan.perez" required />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Correo Electrónico</label>
                  <div className="relative group">
                      <EnvelopeIcon className={ICON_CLASS} />
                      <input type="email" className={INPUT_CLASS} value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="correo@ejemplo.com" required />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>Teléfono / WhatsApp</label>
                  <div className="relative group">
                      <PhoneIcon className={ICON_CLASS} />
                      <input className={INPUT_CLASS} value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+58 412..." />
                  </div>
                </div>
            </div>
          </div>

          {/* SECCIÓN 2: SEGURIDAD Y ROL */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-4 flex items-center gap-2 mt-2">
                <KeyIcon className="w-4 h-4 text-[#E33127]"/> Seguridad y Permisos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                    <label className={LABEL_CLASS}>Rol en el Sistema</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {roleOptions.map((r) => (
                            <div 
                                key={r}
                                onClick={() => onChange("role", r)}
                                className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-[10px] font-bold transition-all ${form.role === r ? 'border-[#E33127] bg-red-50 text-[#E33127]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                            >
                                {roleLabel[r]}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={LABEL_CLASS}>Contraseña</label>
                    <div className="relative group">
                        <KeyIcon className={ICON_CLASS} />
                        <input type="password" className={INPUT_CLASS} value={form.password} onChange={(e) => onChange("password", e.target.value)} placeholder="Mín. 6 caracteres" required minLength={6} />
                    </div>
                </div>

                <div>
                    <label className={LABEL_CLASS}>Confirmar Contraseña</label>
                    <div className="relative group">
                        <KeyIcon className={ICON_CLASS} />
                        <input type="password" className={INPUT_CLASS} value={form.confirm} onChange={(e) => onChange("confirm", e.target.value)} placeholder="Repite la contraseña" required minLength={6} />
                    </div>
                </div>

                {/* Switch de Activo Compacto */}
                <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div 
                        onClick={() => onChange("active", !form.active)}
                        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${form.active ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${form.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                        {form.active ? "Usuario activo inmediatamente" : "Requiere aprobación manual"}
                    </span>
                </div>

            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/users/list" className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all text-center">
                Cancelar
            </Link>
            <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-3 bg-[#E33127] text-white rounded-xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>Guardando...</>
                ) : (
                    <>
                        <CheckBadgeIcon className="w-5 h-5" /> CREAR USUARIO
                    </>
                )}
            </button>
          </div>
      </form>
    </div>
  );
}