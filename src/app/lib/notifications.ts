// src/app/lib/notifications.ts
import { getSession } from "next-auth/react";

export type NotificationItem = {
  id: number | string;
  message: string;
  date?: string;
  status?: string;
  url?: string;
  sender?: number | string;
  recipient?: number | string;
};

const API =
  (process.env.NEXT_PUBLIC_API_FULL?.replace(/\/$/, "")) || "";

/** Lee JSON de forma segura (soporta 204 o cuerpo vacío). */
async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  if (res.status === 204) return null;
  const text = await res.text().catch(() => "");
  if (!text?.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const session = await getSession();
  if (!session?.user?.token || !API) return [];

  try {
    const response = await fetch(`${API}/notification`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) return [];

    const data = await safeJson<any>(response);

    if (Array.isArray(data)) return data as NotificationItem[];
    if (data && typeof data === "object") {
      if (Array.isArray(data.items)) return data.items as NotificationItem[];
      if (Array.isArray(data.content)) return data.content as NotificationItem[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchAllNotifications(): Promise<NotificationItem[]> {
  const session = await getSession();
  if (!session?.user?.token || !API) return [];

  try {
    const response = await fetch(`${API}/notification/all`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) return [];

    const data = await safeJson<any>(response);

    if (Array.isArray(data)) return data as NotificationItem[];
    if (data && typeof data === "object") {
      if (Array.isArray(data.items)) return data.items as NotificationItem[];
      if (Array.isArray(data.content)) return data.content as NotificationItem[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function markAsRead(id: number): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.token || !API) return false;

  try {
    const response = await fetch(`${API}/notification/done/${id}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    // Considera 2xx como éxito (incluye 204 sin cuerpo)
    return response.ok;
  } catch {
    return false;
  }
}
