import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

// 👇 AJUSTE CLAVE: URL FIJA DE PRODUCCIÓN
const API_URL = process.env.NEXT_PUBLIC_API_FULL || "https://motostore-api.onrender.com/api/v1";

/**
 * ------------------------------------------------------------------
 * 1. FUNCIÓN ORIGINAL (Para leer la tabla de usuarios)
 * ------------------------------------------------------------------
 */
export async function fetchUsers(query: string = "", page: number = 1) {
  // 1) Session/token
  const session = await getSession();
  const token = (session as any)?.user?.token ?? (session as any)?.user?.accessToken ?? null;

  // 2) Query params
  const params = new URLSearchParams();
  if (query?.trim()) params.set("query", query.trim());
  params.set("page", String(Math.max(0, (Number(page) || 1) - 1)));
  params.set("elements", String(ITEMS_PER_PAGE));

  // 3) URL base segura (Usamos la constante definida arriba)
  const base = API_URL.replace(/\/+$/, "");
  const url = `${base}/users?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("fetchUsers error:", res.status, txt);
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    const data: any = await res.json();

    let content: any[] = [];
    let totalPages = 0;
    let totalElements: number | undefined;

    if (Array.isArray(data)) {
      content = data;
      totalPages = 1;
      totalElements = data.length;
    } else if (data && typeof data === "object") {
      content =
        data.content ??
        data.items ??
        data.data?.items ??
        data.data ??
        [];

      totalPages =
        Number(data.totalPages ?? data.total_pages ?? 0) ||
        (typeof data.total === "number" && typeof data.size === "number"
          ? Math.ceil(data.total / Math.max(1, Number(data.size)))
          : 0);

      totalElements = Number(
        data.total ?? data.totalElements ?? data.total_elements ?? (Array.isArray(content) ? content.length : 0)
      );
    }

    if (!Array.isArray(content)) content = [];

    return { content, totalPages, totalElements };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

/**
 * ------------------------------------------------------------------
 * 2. NUEVAS FUNCIONES (Para editar perfil y contraseña)
 * ------------------------------------------------------------------
 */

// Función auxiliar para obtener credenciales y URL correcta
async function getAuthHeaders() {
  const session = await getSession();
  const token = (session as any)?.user?.token ?? (session as any)?.user?.accessToken ?? null;
  // Usamos la misma constante API_URL
  const base = API_URL.replace(/\/+$/, "");
  return { base, token };
}

/**
 * Actualiza datos del perfil (Nombre, Teléfono, Email, Cédula)
 */
export async function updateUserProfile(userId: string, data: any) {
  const { base, token } = await getAuthHeaders();
  
  // IMPORTANTE: Asegúrate de que el backend soporte PUT en /users/{id}
  const url = `${base}/users/${userId}`;

  console.log("📡 Conectando a:", url); // Log para depurar en consola del navegador

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ Error Backend:", errorData);
      throw new Error(errorData.detail || errorData.message || "Error al actualizar perfil");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    
    // Si el error es "Failed to fetch", damos un mensaje más claro
    if (error.message === 'Failed to fetch') {
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.");
    }
    throw error;
  }
}

/**
 * Cambia la contraseña del usuario
 */
export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const { base, token } = await getAuthHeaders();
  
  // Ajuste de ruta estándar
  const url = `${base}/users/${userId}/password`; 

  try {
    const res = await fetch(url, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || "La contraseña actual es incorrecta o hubo un error");
    }

    return true; 
  } catch (error: any) {
    console.error("Change Password Error:", error);
    if (error.message === 'Failed to fetch') {
        throw new Error("No se pudo conectar con el servidor.");
    }
    throw error;
  }
}