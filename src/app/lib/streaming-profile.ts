// src/app/lib/streaming-profile.ts
import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

type PagedProfiles = {
  content: any[];
  totalPages: number;
};

/** Intenta leer JSON de forma segura (maneja cuerpo vacío o inválido). */
async function safePagedJson(response: Response): Promise<PagedProfiles> {
  try {
    const txt = await response.text().catch(() => "");
    if (!txt) {
      return { content: [], totalPages: 1 };
    }

    let data: any;
    try {
      data = JSON.parse(txt);
    } catch {
      return { content: [], totalPages: 1 };
    }

    // Si el backend devuelve un array directo
    if (Array.isArray(data)) {
      return { content: data, totalPages: 1 };
    }

    const content = Array.isArray(data?.content) ? data.content : [];
    const totalPages =
      typeof data?.totalPages === "number" && data.totalPages > 0
        ? data.totalPages
        : 1;

    return { content, totalPages };
  } catch {
    return { content: [], totalPages: 1 };
  }
}

function getApiBase(): string {
  // Asegúrate de que esta variable de entorno apunte a tu backend (ej: https://motostore-api.onrender.com/api/v1)
  const base = (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return base;
}

/* =========================================================
   LISTA PAGINADA (ADMIN / GENERAL)
   ========================================================= */
export async function fetchProfiles(
  query: string,
  page: number
): Promise<PagedProfiles> {
  const base = getApiBase();
  if (!base) return { content: [], totalPages: 1 };

  try {
    const session = await getSession();
    const token = (session as any)?.user?.token || (session as any)?.accessToken;

    const params = new URLSearchParams({
      query: query ?? "",
      page: String((page || 1) - 1), // backend usa 0-based
      elements: ITEMS_PER_PAGE.toString(),
    });

    const response = await fetch(`${base}/streaming/profile?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("fetchProfiles: HTTP error", response.status);
      return { content: [], totalPages: 1 };
    }

    return await safePagedJson(response);
  } catch (error) {
    console.error("Database Error (fetchProfiles):", error);
    return { content: [], totalPages: 1 };
  }
}

/* =========================================================
   PERFILES DEL CLIENTE LOGUEADO
   USADO EN /dashboard/streaming
   ========================================================= */
export async function fetchClientProfiles(): Promise<PagedProfiles> {
  const base = getApiBase();
  if (!base) return { content: [], totalPages: 1 };

  try {
    const session = await getSession();
    const token = (session as any)?.user?.token || (session as any)?.accessToken;

    // NOTA: Ajusta la ruta si tu backend Python usa solo "/streaming"
    // He dejado /streaming/profile/client si así lo tienes configurado, 
    // pero si usas el backend simple que te di, podría ser solo "/streaming" filtrado.
    const response = await fetch(`${base}/streaming/profile/client`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    // Si falla la ruta específica de cliente, intentamos la genérica como fallback
    if (response.status === 404) {
       const fallback = await fetch(`${base}/streaming`, {
         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
       });
       if(fallback.ok) return await safePagedJson(fallback);
    }

    if (!response.ok) {
      console.error("fetchClientProfiles: HTTP error", response.status);
      return { content: [], totalPages: 1 };
    }

    return await safePagedJson(response);
  } catch (error) {
    console.error("Database Error (fetchClientProfiles):", error);
    return { content: [], totalPages: 1 };
  }
}

/* =========================================================
   ELIMINAR PERFIL (SOFT DELETE)
   ========================================================= */
export async function fetchRemoveProfile(id: string | number) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL not configured");

  try {
    const session = await getSession();
    const token = (session as any)?.user?.token || (session as any)?.accessToken;

    const response = await fetch(`${base}/streaming/profile/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response;
  } catch (error) {
    console.error("Database Error (fetchRemoveProfile):", error);
    throw new Error("Failed to remove profile.");
  }
}

/* =========================================================
   ELIMINAR PERFIL (HARD DELETE)
   ========================================================= */
export async function fetchHardRemoveProfile(id: string | number) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL not configured");

  try {
    const session = await getSession();
    const token = (session as any)?.user?.token || (session as any)?.accessToken;

    const response = await fetch(`${base}/streaming/profile/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response;
  } catch (error) {
    console.error("Database Error (fetchHardRemoveProfile):", error);
    throw new Error("Failed to hard-remove profile.");
  }
}

/* =========================================================
   CREAR NUEVO PERFIL (POST) - 🔥 AQUÍ ESTÁ LA CORRECCIÓN
   ========================================================= */
export async function createClientProfile(data: any, token?: string) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL not configured");

  // 1. Prioridad: Token pasado por argumento > Token de sesión
  let authToken = token;
  if (!authToken) {
     const session = await getSession();
     authToken = (session as any)?.user?.token || (session as any)?.accessToken;
  }

  // 2. Llamada al Backend (Asegúrate que tu backend escuche en /streaming)
  const response = await fetch(`${base}/streaming`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error creating profile:", errorBody);
    throw new Error("Error al guardar en el servidor");
  }

  return await response.json();
}