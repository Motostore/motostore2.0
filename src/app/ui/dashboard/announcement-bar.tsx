"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, MegaphoneIcon } from "@heroicons/react/24/outline";

const DEFAULT_MSG = "🚀 Muy pronto: ¡Bienvenido a Moto Store LLC 2.0! Renovamos nuestra plataforma.";
// Ajusta esto si tu backend está en otro lado
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>(DEFAULT_MSG);

  useEffect(() => {
    // 1. Revisar si el usuario lo cerró antes
    const hidden = localStorage.getItem("ms_announcement_hidden");
    if (hidden === "1") {
        setOpen(false);
        setLoading(false);
        return;
    }

    // 2. Función para buscar el anuncio real en la API
    const fetchAnnouncement = async () => {
        try {
            // Intentamos buscar en el endpoint correcto de Anuncios
            const res = await fetch(`${API_BASE}/announcements`, { 
                cache: 'no-store',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                // Asumimos que la API devuelve una lista o un objeto
                // Buscamos el primer anuncio activo si es una lista
                const active = Array.isArray(data) ? data.find((a: any) => a.active) : data;
                
                if (active && active.message) {
                    setMsg(active.message);
                }
            }
        } catch (error) {
            console.warn("Usando anuncio por defecto (API offline)");
        } finally {
            setLoading(false);
        }
    };

    fetchAnnouncement();
  }, []);

  if (!open) return null;

  return (
    <div className={`relative bg-[#E33127] text-white shadow-sm z-40 transition-all duration-500 ease-in-out ${loading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
        {/* Ícono y Mensaje */}
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <MegaphoneIcon className="w-5 h-5 text-white/90 shrink-0 animate-pulse" />
          <p className="text-xs md:text-sm font-bold tracking-wide text-white truncate w-full">
            {msg}
          </p>
        </div>

        {/* Botón Cerrar */}
        <button
          onClick={() => {
            setOpen(false);
            localStorage.setItem("ms_announcement_hidden", "1");
          }}
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all shrink-0"
          aria-label="Cerrar anuncio"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
