// src/app/lib/admin.products.ts
export type AdminProduct = {
  id?: number | string;
  name: string;
  price: number;
  active: boolean;
};

function apiBase() {
  // Asegúrate que .env.local tenga NEXT_PUBLIC_API_FULL, por ejemplo:
  // NEXT_PUBLIC_API_FULL=http://localhost:8080/api/v1
  return (process.env.NEXT_PUBLIC_API_FULL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");
}

function authHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (token) h.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return h;
}

// --- Debug simple para la UI ---
let lastInfo = { url: "", status: 0, error: "" };
export function getLastProductsFetchInfo() {
  return lastInfo;
}

// Intenta distintas rutas comunes para listar productos
function productListUrls(base: string) {
  return [
    `${base}/products`,           // típico REST
    `${base}/products/all`,       // algunos backends
    `${base}/admin/products`,     // variante admin
    `${base}/product`,            // singular (por si acaso)
  ];
}

// Intenta extraer array de productos de diferentes formas
function coerceProducts(raw: any): AdminProduct[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as AdminProduct[];

  const cands = [
    raw.data, raw.items, raw.content, raw.result, raw.results, raw.products, raw.productList,
    raw?.data?.items, raw?.data?.content, raw?.data?.results, raw?.data?.products,
  ];

  for (const c of cands) {
    if (Array.isArray(c)) return c as AdminProduct[];
  }
  return null;
}

export async function adminListProducts(token?: string): Promise<AdminProduct[]> {
  const base = apiBase();
  const urls = productListUrls(base);
  lastInfo = { url: "", status: 0, error: "" };

  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: authHeaders(token),
        cache: "no-store",
        credentials: "include",
      });
      lastInfo = { url, status: r.status, error: "" };

      if (!r.ok) {
        // si 401 con token, quizá la API de lista no requiere auth; probemos sin Authorization una vez
        if ((r.status === 401 || r.status === 403) && token) {
          const r2 = await fetch(url, {
            method: "GET",
            headers: authHeaders(undefined),
            cache: "no-store",
            credentials: "include",
          });
          lastInfo = { url, status: r2.status, error: "" };
          if (!r2.ok) continue;
          const txt2 = (await r2.text()).trim();
          const j2 = txt2 ? JSON.parse(txt2) : null;
          const arr2 = coerceProducts(j2);
          if (arr2) return arr2;
          continue;
        }
        continue;
      }

      const txt = (await r.text()).trim();
      if (!txt) continue;
      let json: any;
      try { json = JSON.parse(txt); } catch { continue; }

      const arr = coerceProducts(json);
      if (arr) return arr;
    } catch (e: any) {
      lastInfo = { url, status: 0, error: e?.message ?? "fetch error" };
      // sigue con la siguiente URL
    }
  }

  return [];
}

export async function adminCreateProduct(input: AdminProduct, token?: string): Promise<AdminProduct> {
  const r = await fetch(`${apiBase()}/products`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
    cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`POST /products ${r.status}`);
  return r.json();
}

export async function adminUpdateProduct(id: number | string, input: Partial<AdminProduct>, token?: string): Promise<AdminProduct> {
  const r = await fetch(`${apiBase()}/products/${encodeURIComponent(String(id))}`, {
    method: "PUT", headers: authHeaders(token), body: JSON.stringify(input),
    cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`PUT /products/${id} ${r.status}`);
  return r.json();
}

export async function adminDeleteProduct(id: number | string, token?: string): Promise<void> {
  const r = await fetch(`${apiBase()}/products/${encodeURIComponent(String(id))}`, {
    method: "DELETE", headers: authHeaders(token),
    cache: "no-store", credentials: "include",
  });
  if (!r.ok) throw new Error(`DELETE /products/${id} ${r.status}`);
}



