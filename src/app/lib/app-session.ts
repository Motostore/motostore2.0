// src/app/lib/app-session.ts (CÓDIGO FINAL Y CORREGIDO - FIX DE TIPADO DE SESIÓN)

// NO importamos el tipo Session de "next-auth" genérico, sino que lo definimos extendido.
// import type { Session } from "next-auth"; // <-- Eliminado

// ⭐ FIX PRO: Definimos la interfaz de Usuario que realmente usamos en el proyecto
// incluyendo 'id', 'name', 'email', 'role', y 'balanceText' (seteadas en route.ts).
interface ExtendedUser {
  id: string; // Garantizamos que el ID existe
  name: string; // Garantizamos que el nombre existe
  email: string; // ¡La propiedad que faltaba y causaba el error!
  image?: string | null;
  role: string; // El rol es un campo crítico en tu app
  balanceText?: string; // Balance también es crucial
}

// ⭐ FIX PRO: Definimos la interfaz Session final
// Esto es lo que Dashboard.tsx importará y usará.
export interface Session {
  user: ExtendedUser; // Usamos nuestro tipo de usuario extendido
  expires: string;
  backendToken?: string; // Propiedad personalizada que asignaste en route.ts
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;

    const txt = (await res.text())?.trim();
    if (!txt) return null;

    const json = JSON.parse(txt);
    
    // Al castear a 'Session' ahora TypeScript sabe que 'user.email' existe.
    if (json && typeof json === "object" && json.user) return json as Session; 
    return null;
  } catch {
    return null;
  }
}
