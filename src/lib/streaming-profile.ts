// src/app/lib/streaming-profile.ts
import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

type PagedProfiles = {
  content: any[];
  totalPages: number;
};

// --- Helper para leer JSON seguro ---
async function safePagedJson(response: Response): Promise<PagedProfiles> {
  try {
    const txt = await response.text().catch(() => "");
    if (!txt) return { content: [], totalPages: 1 };
    
    let data: any;
    try { data = JSON.parse(txt); } catch { return { content: [], totalPages: 1 }; }

    if (Array.isArray(data)) return { content: data, totalPages: 1 };

    const content = Array.isArray(data?.content) ? data.content : [];
    const totalPages = (typeof data?.totalPages === "number" && data.totalPages > 0) ? data.totalPages : 1;

    return { content, totalPages };
  } catch {
    return { content: [], totalPages: 1 };
  }
}

function getApiBase(): string {
  // Asegúrate de que esto apunte a tu backend en Render
  const base = (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/$/, "");
  return base;
}

// 1. OBTENER PERFILES (ADMIN)
export async function fetchProfiles(query: string, page: number): Promise<PagedProfiles> {
  const base = getApiBase();
  try {
    const session = await getSession();
    const token = (session as any)?.user?.accessToken || (session as any)?.user?.token;

    const params = new URLSearchParams({
      query: query ?? "",
      page: String((page || 1) - 1),
      elements: ITEMS_PER_PAGE.toString(),
    });

    const response = await fetch(`${base}/streaming?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    });

    if (!response.ok) return { content: [], totalPages: 1 };
    return await safePagedJson(response);
  } catch (error) {
    console.error("Fetch Error:", error);
    return { content: [], totalPages: 1 };
  }
}

// 2. OBTENER PERFILES (CLIENTE)
export async function fetchClientProfiles(): Promise<PagedProfiles> {
  const base = getApiBase();
  try {
    const session = await getSession();
    const token = (session as any)?.user?.accessToken || (session as any)?.user?.token;

    // Intenta ruta específica de cliente, si falla usa la general
    let response = await fetch(`${base}/streaming/client`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    });

    if (response.status === 404) {
       response = await fetch(`${base}/streaming`, {
         headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
       });
    }

    if (!response.ok) return { content: [], totalPages: 1 };
    return await safePagedJson(response);
  } catch (error) {
    return { content: [], totalPages: 1 };
  }
}

// 3. ELIMINAR (DELETE)
export async function fetchRemoveProfile(id: string | number) {
  const base = getApiBase();
  const session = await getSession();
  const token = (session as any)?.user?.accessToken || (session as any)?.user?.token;

  return await fetch(`${base}/streaming/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

// 🔥 4. CREAR PERFIL (POST) - LA FUNCIÓN CRÍTICA
export async function createClientProfile(data: any, token?: string) {
  const base = getApiBase();
  
  // Prioridad al token pasado por argumento, sino busca en sesión
  let authToken = token;
  if (!authToken) {
     const session = await getSession();
     authToken = (session as any)?.user?.accessToken || (session as any)?.user?.token;
  }

  // ⚠️ NOTA: La ruta es /streaming (sin prefijos extra porque getApiBase ya trae /api/v1)
  const response = await fetch(`${base}/streaming`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Esto mostrará el error real en tu alerta roja
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}