// src/app/lib/users.service.ts
import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

/**
 * Trae usuarios del backend.
 * Mantiene la firma original: fetchUsers(query, page)
 * Devuelve SIEMPRE un objeto con { content: [], totalPages: number, totalElements?: number }
 * para que tu <Table /> no se rompa aunque el backend falle o cambie el shape.
 */
export async function fetchUsers(query: string = "", page: number = 1) {
  // 1) Session/token
  const session = await getSession();
  const token = (session as any)?.user?.token ?? (session as any)?.user?.accessToken ?? null;

  // 2) Query params (tu API parece usar page 0-based y 'elements')
  const params = new URLSearchParams();
  if (query?.trim()) params.set("query", query.trim());
  params.set("page", String(Math.max(0, (Number(page) || 1) - 1)));
  params.set("elements", String(ITEMS_PER_PAGE));

  // 3) URL base segura
  const base =
    (process.env.NEXT_PUBLIC_API_FULL || "http://localhost:8080/api/v1").replace(/\/+$/, "") ||
    "http://localhost:8080/api/v1";
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
      // Devuelve forma segura para no romper la UI
      const txt = await res.text().catch(() => "");
      console.error("fetchUsers error:", res.status, txt);
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      // Si el backend no devuelve JSON, no rompemos la tabla
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    const data: any = await res.json();

    // 4) Normalización de respuesta (soporta distintos shapes)
    //    - array directo
    //    - objeto paginado con content/items/data
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

      // Si no viene totalPages, lo calculamos con total/size si existen
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
    // Forma segura para tu <Table />
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}
