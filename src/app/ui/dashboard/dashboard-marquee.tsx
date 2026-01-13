"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MarqueeBar from "../common/MarqueeBar";

// URL base de la API (Igual que en el resto de tu app)
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/$/, "");

// Lista de posibles endpoints donde puede estar guardado el anuncio
const ENDPOINTS = ["/users/announcement-bar", "/announcement-bar", "/admin/announcement"];

export default function DashboardMarquee() {
  const { data: session } = useSession();
  
  // Estado inicial: Mensaje por defecto (mientras carga o si falla)
  const [mensaje, setMensaje] = useState("🚀 Bienvenido a Moto Store LLC. Sistema activo y operando al 100%.");
  const [isVisible, setIsVisible] = useState(true); // Mostrar por defecto para que no parpadee
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchAnuncio = async () => {
      // Necesitamos el token para leer la API (si tu API es privada)
      const token = (session as any)?.accessToken || (session as any)?.user?.token;
      
      // Intentamos leer de la API
      try {
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        
        let data = null;
        
        // Probamos los endpoints en orden hasta encontrar datos
        for (const ep of ENDPOINTS) {
          try {
            const res = await fetch(`${API_BASE}${ep}`, { headers, cache: 'no-store' });
            if (res.ok) {
              const json = await res.json();
              // A veces la API devuelve un array o un objeto { data: ... }
              data = Array.isArray(json) ? json[0] : (json?.data || json);
              if (data) break; // ¡Encontrado!
            }
          } catch (e) { /* Siguiente intento */ }
        }

        if (data) {
          // 1. Verificar si está ACTIVO
          const active = data.active !== false; // Default true

          // 2. Verificar FECHAS (Si las tiene configuradas)
          const now = new Date();
          const start = data.startsAt ? new Date(data.startsAt) : null;
          const end = data.endsAt ? new Date(data.endsAt) : null;
          
          let inDateRange = true;
          if (start && now < start) inDateRange = false; // Aún no empieza
          if (end && now > end) inDateRange = false;     // Ya terminó

          if (active && inDateRange && data.message) {
            setMensaje(data.message);
            setIsVisible(true);
          } else {
            // Si está apagado o fuera de fecha, ocultamos la barra o mostramos un default
             setIsVisible(false); 
          }
        }
      } catch (err) {
        console.error("Error cargando anuncio:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchAnuncio();
  }, [session]);

  // Si se determinó que no debe verse, no renderizamos nada
  if (isLoaded && !isVisible) return null;

  return (
    // ESTILO: Blanco Minimalista (Clean White)
    <div className="w-full bg-white border-y border-slate-200 py-2 z-40 relative shadow-sm text-slate-800 font-medium">
      <MarqueeBar 
        text={mensaje} 
        styleType="minimal" 
      />
    </div>
  );
}