"use client";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_FULL || "http://localhost:8080/api/v1").replace(
    /\/$/,
    ""
  );

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data: any = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

// 🔹 Obtener saldo para un usuario concreto
export async function getWalletBalance(userId: number) {
  return apiFetch(`/wallet/balance?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
  });
}

// ✅ 🔹 FUNCIÓN AGREGADA (Soluciona el error de Vercel)
// Esta función envía los datos del depósito al backend
export async function createWalletDeposit(data: { amount: number; paymentMethod?: string; [key: string]: any }) {
  // Ajusta la ruta "/wallet/deposit" si tu backend usa otra URL específica para crear depósitos
  return apiFetch("/wallet/deposit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


