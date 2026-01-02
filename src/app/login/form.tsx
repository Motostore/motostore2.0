// src/app/login/form.tsx (EDICIÓN FINAL: ULTRA PREMIUM ORO PRO +++)

"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import toast, { Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Animation } from "../components/InputErrors";
import { LoginSchema } from "../utils/schemas";
import ResetPasswordModal from "./ResetPasswordModal";

// --- ICONOS SOCIALES MEJORADOS ---
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

type LoginFormValues = {
  username: string;
  password: string;
};

export default function Form() { 
  const router = useRouter();
  const [revealPassword, setRevealPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" },
    resolver: yupResolver(LoginSchema) as any,
  });

  const onSubmit = handleSubmit(async (data) => {
    const { username, password } = data;
    const result = await signIn("credentials", { username, password, redirect: false });

    if (result?.ok) {
      toast.success("¡Bienvenido de vuelta!", { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
      reset();
      router.push("/dashboard");
    } else {
      toast.error("Datos incorrectos. Intenta de nuevo.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
    }
  });

  const handleSocialLogin = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  // ESTILOS DE INPUTS (Nivel PRO)
  const inputWrapperClass = "relative group";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127] transition-colors duration-300 w-5 h-5 z-10";
  const inputClass = "block w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#E33127]/10 focus:border-[#E33127] focus:bg-white transition-all duration-300 shadow-sm";

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        
        {/* Usuario / Correo */}
        <div className={inputWrapperClass}>
          <UserIcon className={iconClass} />
          <input
            {...register("username")}
            placeholder="Correo o Usuario"
            type="text"
            className={inputClass}
          />
        </div>
        <Animation errors={errors} field="username" />

        {/* Contraseña */}
        <div className={inputWrapperClass}>
          <LockClosedIcon className={iconClass} />
          <input
            {...register("password")}
            placeholder="Contraseña"
            type={revealPassword ? "text" : "password"}
            className={`${inputClass} pr-12`} 
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setRevealPassword((current) => !current)}
          >
            {revealPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <Animation errors={errors} field="password" />

        {/* Olvidaste contraseña (Alineado a la derecha, sutil) */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowModal(true); }}
            className="text-xs font-bold text-slate-500 hover:text-[#E33127] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* BOTÓN PRINCIPAL: Rojo Marca con Sombra Suave */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full flex justify-center items-center gap-2
            rounded-xl py-3.5
            bg-[#E33127] hover:bg-[#c92a21]
            text-white text-sm font-bold tracking-wide uppercase
            shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5
            disabled:opacity-70 disabled:cursor-not-allowed
            transition-all duration-300
          "
        >
          {isSubmitting ? "Verificando..." : (
            <>
              Iniciar Sesión <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

      {/* SEPARADOR ELEGANTE */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">O continúa con</span></div>
      </div>

      {/* BOTONES SOCIALES (Estilo Tarjeta) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white py-3 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
        >
          {GoogleIcon} <span className="text-sm font-bold text-slate-700">Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("apple")}
          className="flex items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white py-3 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
        >
          {AppleIcon} <span className="text-sm font-bold text-slate-700">Apple</span>
        </button>
      </div>

      <Toaster />
      {showModal && <ResetPasswordModal onClose={() => setShowModal(false)} />}
    </div>
  );
}



















