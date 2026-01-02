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
  const base = (process.env.NEXT_PUBLIC_API_FULL || "").replace(/\/$/, "");
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
    const token = (session as any)?.user?.token;

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
    const token = (session as any)?.user?.token;

    const response = await fetch(`${base}/streaming/profile/client`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

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
    const token = (session as any)?.user?.token;

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
    const token = (session as any)?.user?.token;

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
