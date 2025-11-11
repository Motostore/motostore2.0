// src/app/lib/app-session.ts
import type { Session } from "next-auth";

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;

    // Puede venir vacío en casos raros → parsear como texto primero
    const txt = (await res.text())?.trim();
    if (!txt) return null;

    const json = JSON.parse(txt);
    // Estructura típica: { user: {...}, expires: "..." } o null
    if (json && typeof json === "object") return json as Session;
    return null;
  } catch {
    return null;
  }
}
