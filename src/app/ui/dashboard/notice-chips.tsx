"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  XMarkIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  MegaphoneIcon,
  FireIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

/* ================= TYPES & HELPERS ================= */

type Variant = "info" | "success" | "warning" | "error" | "neutral";

type Announcement = {
  id?: string | number;
  message: string;
  variant: Variant;
  active: boolean;
  dismissible: boolean;
  linkUrl?: string;
  startsAt?: string;
  endsAt?: string;
};

// Estilos idénticos a la vista previa del Admin para consistencia total
const VARIANT_STYLES: Record<Variant, string> = {
  info: "bg-gradient-to-r from-blue-600 to-blue-500 border-blue-800 text-white shadow-blue-500/20",
  success: "bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-800 text-white shadow-emerald-500/20",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500 border-orange-700 text-white shadow-orange-500/20",
  error: "bg-gradient-to-r from-[#E33127] to-red-600 border-red-900 text-white shadow-red-500/20",
  neutral: "bg-gradient-to-r from-slate-800 to-slate-700 border-black text-white shadow-slate-500/20",
};

const ICONS: Record<Variant, any> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: FireIcon,
  neutral: MegaphoneIcon,
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function pickToken(s: any) {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" && t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
}

/* ================= COMPONENT ================= */

export default function NoticeChips() {
  const { data: session } = useSession();
  const base = useMemo(() => apiBase(), []);
  const token = useMemo(() => pickToken(session), [session]);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // 1. Cargar el Anuncio Activo
  useEffect(() => {
    let active = true;

    async function fetchAnnouncement() {
      if (!base) return;
      
      const headers: Record<string, string> = { 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      };
      if (token) headers.Authorization = token;

      // Intentamos leer del endpoint de usuario (lectura)
      // Ajusta estas rutas si tu backend tiene una específica para "get current announcement"
      const endpoints = [
        "/users/announcement-bar/current", // Ideal: Endpoint específico para "mi anuncio actual"
        "/users/announcement-bar",         // Fallback: Lista de anuncios
        "/announcement-bar"                // Fallback genérico
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(`${base}${ep}`, { headers, cache: "no-store" });
          if (!res.ok) continue;
          
          const data = await res.json();
          // Manejar si devuelve un objeto directo o un array
          const item = Array.isArray(data) ? data[0] : (data?.data || data);

          if (item && item.active && item.message) {
            // Validar fechas si el backend no lo hace
            const now = new Date().getTime();
            const start = item.startsAt ? new Date(item.startsAt).getTime() : 0;
            const end = item.endsAt ? new Date(item.endsAt).getTime() : Infinity;

            if (now >= start && now <= end) {
              if (active) setAnnouncement(item);
              return; // Encontramos uno válido
            }
          }
        } catch (e) {
          console.error("Error fetching announcement:", e);
        }
      }
    }

    fetchAnnouncement();
    return () => { active = false; };
  }, [base, token]);

  // Si no hay anuncio o el usuario lo cerró, no renderizar nada
  if (!announcement || !isVisible) return null;

  const Icon = ICONS[announcement.variant as Variant] || InformationCircleIcon;
  const styleClass = VARIANT_STYLES[announcement.variant as Variant] || VARIANT_STYLES.info;

  return (
    <div className="w-full bg-white border-b border-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        
        {/* BARRA PREMIUM */}
        <div className={`relative overflow-hidden rounded-xl p-4 shadow-lg border-l-4 animate-in slide-in-from-top-2 duration-500 ${styleClass}`}>
            
            {/* Efecto de brillo de fondo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start gap-4 relative z-10">
                {/* Icono */}
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Contenido */}
                <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-white leading-snug drop-shadow-sm whitespace-pre-wrap">
                        {announcement.message}
                    </p>

                    {announcement.linkUrl && (
                        <div className="mt-3">
                            <a 
                                href={announcement.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-black uppercase tracking-wide hover:bg-slate-100 hover:scale-105 transition-all shadow-md"
                            >
                                <LinkIcon className="w-3 h-3" />
                                Ver Más
                            </a>
                        </div>
                    )}
                </div>

                {/* Botón Cerrar */}
                {announcement.dismissible && (
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="text-white/60 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
                        title="Ocultar anuncio"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}