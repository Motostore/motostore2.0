// src/app/lib/admin.payments.ts
export type PaymentMethod = {
  id?: number | string;
  name: string;
  enabled: boolean;
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_FULL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");
}

function authHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (token) h.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return h;
}

export async function adminListPaymentMethods(token?: string): Promise<PaymentMethod[]> {
  const r = await fetch(`${apiBase()}/payments/methods`, {
    method: "GET", headers: authHeaders(token), cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`GET /payments/methods ${r.status}`);
  const txt = (await r.text()).trim();
  return txt ? JSON.parse(txt) : [];
}

export async function adminUpsertPaymentMethod(input: PaymentMethod, token?: string): Promise<PaymentMethod> {
  const r = await fetch(`${apiBase()}/payments/methods`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input), cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`POST /payments/methods ${r.status}`);
  return r.json();
}

export async function adminDeletePaymentMethod(id: number | string, token?: string): Promise<void> {
  const r = await fetch(`${apiBase()}/payments/methods/${encodeURIComponent(String(id))}`, {
    method: "DELETE", headers: authHeaders(token), cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`DELETE /payments/methods/${id} ${r.status}`);
}

