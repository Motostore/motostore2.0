// src/app/lib/api.ts (CÓDIGO FINAL Y CORREGIDO - FIX DE SINTAXIS)

const BASE = process.env.NEXT_PUBLIC_API_BASE!; // usa tu variable de entorno

type Opts = RequestInit & { authToken?: string };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { authToken, headers, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // ⭐ FIX PRO: Corrección del template literal para resolver TS1127 y TS1160
    throw new Error(`API ${res.status} ${res.statusText} → ${text}`);
  }
  return res.json() as Promise<T>;
}