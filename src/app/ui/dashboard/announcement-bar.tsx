"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, MegaphoneIcon } from "@heroicons/react/24/outline";

const DEFAULT_MSG = "🚀 Muy pronto: ¡Bienvenido a Moto Store LLC 2.0! Renovamos nuestra plataforma.";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState<string>(
    process.env.NEXT_PUBLIC_ANNOUNCEMENT ?? DEFAULT_MSG
  );

  useEffect(() => {
    try {
      const hidden = localStorage.getItem("ms_announcement_hidden");
      const saved = localStorage.getItem("ms_announcement_msg");
      if (hidden === "1") setOpen(false);
      if (saved && saved.trim()) setMsg(saved);
    } catch {}
  }, []);

  if (!open || !msg) return null;

  return (
    // 🔥 CAMBIO: Usamos TU ROJO de marca (#E33127)
    // Texto blanco para contraste perfecto.
    <div className="relative bg-[#E33127] text-white shadow-sm z-40 transition-all duration-500 ease-in-out">
      
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
        {/* Ícono y Mensaje */}
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          {/* Icono sutil en blanco */}
          <MegaphoneIcon className="w-5 h-5 text-white/90 shrink-0" />

          {/* Texto */}
          <p className="text-xs md:text-sm font-bold tracking-wide text-white truncate w-full">
            {msg}
          </p>
        </div>

        {/* Botón Cerrar (Blanco semitransparente que se ilumina al tocar) */}
        <button
          onClick={() => {
            setOpen(false);
            try { localStorage.setItem("ms_announcement_hidden", "1"); } catch {}
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

