// src/app/login/ResetPasswordModal.tsx (CORREGIDO: LA X YA FUNCIONA)

"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { EnvelopeIcon, KeyIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ResetPasswordModalProps {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animación de entrada suave
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleInternalClose = useCallback(() => {
    if (loading) return; 
    setVisible(false); // Inicia animación de salida
    setTimeout(onClose, 300); // Espera a que termine la animación
  }, [onClose, loading]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleInternalClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleInternalClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      toast.error("Por favor ingresa un correo válido.", { style: { borderRadius: '12px', background: '#333', color: '#fff' }});
      return;
    }

    setLoading(true);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}${process.env.NEXT_PUBLIC_API_AUTH}/forgot-password`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al solicitar recuperación.");
      }

      toast.success("¡Enlace enviado! Revisa tu bandeja de entrada.", {
          style: { borderRadius: '12px', background: '#333', color: '#fff' },
          duration: 5000,
      });

      handleInternalClose();

    } catch (error: any) {
      toast.error(error.message || "Error de conexión.", { style: { borderRadius: '12px', background: '#333', color: '#fff' }});
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS REACTIVOS
  const inputWrapperClass = "relative group";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127] transition-colors duration-300 w-6 h-6 z-10 pointer-events-none";
  const inputClass = "block w-full bg-slate-50 border border-slate-200 text-slate-900 text-base font-medium rounded-xl pl-12 pr-4 py-4 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#E33127]/10 focus:border-[#E33127] focus:bg-white transition-all duration-300 shadow-sm";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "bg-slate-900/80 backdrop-blur-md opacity-100" : "bg-slate-900/0 backdrop-blur-none opacity-0"
      }`}
      onClick={(e) => e.target === e.currentTarget && handleInternalClose()}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          visible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"
        }`}
      >
        
        {/* CABECERA VISUAL (Rojo con patrón sutil) */}
        <div className="bg-gradient-to-br from-[#E33127] to-[#B91C1C] p-6 text-center relative overflow-hidden">
            
            {/* 🛑 FIX 1: Agregamos 'pointer-events-none' para que la decoración no bloquee clics */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-3 shadow-inner">
                    <KeyIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    Recuperar Acceso
                </h3>
                <p className="text-white/90 text-sm font-medium mt-1 max-w-xs">
                    No te preocupes, te ayudaremos a restablecer tu contraseña.
                </p>
            </div>

            {/* 🛑 FIX 2: Agregamos 'z-50' para forzar que el botón esté ENCIMA de todo */}
            <button
                type="button" // Es buena práctica especificar type="button"
                onClick={handleInternalClose}
                disabled={loading}
                className="absolute top-4 right-4 z-50 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">
                        Ingresa tu correo registrado
                    </label>
                    
                    <div className={inputWrapperClass}>
                        <EnvelopeIcon className={iconClass} />
                        <input
                            name="email"
                            type="email"
                            required
                            disabled={loading}
                            className={inputClass}
                            placeholder="ejemplo@correo.com"
                            autoFocus
                        />
                    </div>
                </div>

                {/* BOTONES */}
                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full rounded-xl py-4
                            bg-[#E33127] hover:bg-[#c92a21]
                            text-white text-sm font-black tracking-widest uppercase
                            shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5
                            disabled:opacity-70 disabled:cursor-not-allowed
                            transition-all duration-300 flex items-center justify-center gap-2
                        "
                    >
                        {loading ? (
                            "Enviando..."
                        ) : (
                            <>
                                Enviar Enlace <PaperAirplaneIcon className="w-5 h-5 -rotate-45 mb-1" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleInternalClose}
                        disabled={loading}
                        className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                    >
                        Cancelar y volver
                    </button>
                </div>

            </form>
        </div>

      </div>
    </div>
  );
}





