"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

/* ================= HELPERS ================= */

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
}

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

/* ================= PAGE COMPONENT ================= */

export default function SettingsPasswordPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Visibilidad de inputs
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Validaciones visuales en tiempo real
  const isLengthValid = form.newPassword.length >= 6;
  const isMatch = form.newPassword && form.newPassword === form.confirmPassword;
  const isDifferent = form.newPassword !== form.currentPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // 1. Validaciones previas
    if (!form.currentPassword) return toast.error("Ingresa tu clave actual.");
    if (!isLengthValid) return toast.error("La nueva clave debe tener al menos 6 caracteres.");
    if (!isMatch) return toast.error("Las nuevas contraseñas no coinciden.");
    if (!isDifferent) return toast.error("La nueva contraseña no puede ser igual a la actual.");

    setLoading(true);
    const token = pickToken(session);
    const base = apiBase();

    try {
      // 2. Petición al Backend (Ajusta la ruta '/users/change-password' según tu API real)
      const res = await fetch(`${base}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        }),
      });

      // 3. Manejo de respuesta
      if (!res.ok) {
        // Intentamos leer el mensaje de error del backend
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "La contraseña actual es incorrecta o hubo un error.");
      }

      toast.success("¡Contraseña actualizada exitosamente!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Limpiar formulario

    } catch (err: any) {
      toast.error(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>

      {/* HEADER */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <KeyIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Cambio de <span className="text-[#E33127]">Clave</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Actualiza tu contraseña para mantener tu cuenta segura.
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 space-y-8 relative overflow-hidden">
            
            {/* Decoración de Fondo (Brillo) */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full -mr-10 -mt-10 blur-3xl opacity-50 pointer-events-none"></div>

            {/* SECCIÓN 1: CLAVE ACTUAL */}
            <div className="space-y-4 relative z-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldExclamationIcon className="w-4 h-4"/> Verificación de Seguridad
                </h3>
                
                <div className="relative group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña Actual</label>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                        <input
                            type={showCurrent ? "text" : "password"}
                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                            placeholder="Ingresa tu clave actual"
                            value={form.currentPassword}
                            onChange={e => setForm({...form, currentPassword: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showCurrent ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-slate-100"></div>

            {/* SECCIÓN 2: NUEVA CLAVE */}
            <div className="space-y-5 relative z-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <KeyIcon className="w-4 h-4"/> Nueva Credencial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nueva Clave */}
                    <div className="relative group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                                placeholder="Mínimo 6 caracteres"
                                value={form.newPassword}
                                onChange={e => setForm({...form, newPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showNew ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Clave */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirmar Contraseña</label>
                        <input
                            type={showNew ? "text" : "password"}
                            className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all font-medium text-slate-800 ${
                                form.confirmPassword && !isMatch 
                                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                                    : "border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10"
                            }`}
                            placeholder="Repite la clave"
                            value={form.confirmPassword}
                            onChange={e => setForm({...form, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>

                {/* Validadores Visuales (Checklist) */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-all duration-300 ${isLengthValid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                        <CheckCircleIcon className={`w-4 h-4 ${isLengthValid ? "opacity-100" : "opacity-30"}`} />
                        Mínimo 6 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-all duration-300 ${isMatch && form.newPassword ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                        <CheckCircleIcon className={`w-4 h-4 ${isMatch && form.newPassword ? "opacity-100" : "opacity-30"}`} />
                        Las contraseñas coinciden
                    </div>
                </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !isMatch || !isLengthValid || !form.currentPassword}
                    className="px-8 py-4 rounded-xl bg-[#E33127] text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                >
                    {loading ? (
                        <><ArrowPathIcon className="w-5 h-5 animate-spin"/> Procesando...</> 
                    ) : (
                        <>Actualizar Contraseña</>
                    )}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
