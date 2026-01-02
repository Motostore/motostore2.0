// src/app/lib/catalog.ts
export type CatalogItem = {
  id: string | number;
  name: string;
  price: number;
  active: boolean;
  source: "products" | "marketing" | "recharges" | "licenses" | "streaming";
};

type FetchLog = { cat: string; url: string; status: number; note?: string };
const __log: FetchLog[] = [];
export function getCatalogDebug(): FetchLog[] { return __log.slice(-50); }
function log(cat: string, url: string, status: number, note?: string) { __log.push({ cat, url, status, note }); }

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_FULL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");
}

function authHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  if (token) h.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return h;
}

async function tryJson(cat: string, url: string, token?: string) {
  try {
    // 1) con token (si hay)
    const r1 = await fetch(url, { headers: authHeaders(token), cache: "no-store", credentials: "include" });
    log(cat, url, r1.status, token ? "with token" : "no token");
    if (r1.ok) {
      const txt = (await r1.text()).trim();
      return { ok: true as const, json: txt ? JSON.parse(txt) : null };
    }
    // 2) fallback sin token si 401/403
    if (token && (r1.status === 401 || r1.status === 403)) {
      const r2 = await fetch(url, { headers: authHeaders(undefined), cache: "no-store", credentials: "include" });
      log(cat, url, r2.status, "fallback no token");
      if (r2.ok) {
        const txt = (await r2.text()).trim();
        return { ok: true as const, json: txt ? JSON.parse(txt) : null };
      }
    }
    return { ok: false as const, json: null };
  } catch {
    log(cat, url, 0, "network error");
    return { ok: false as const, json: null };
  }
}

function pickArray(j: any): any[] | null {
  if (!j) return null;
  if (Array.isArray(j)) return j;
  const cands = [j.data, j.items, j.content, j.results, j.result, j.list, j.productList, j.products];
  for (const c of cands) if (Array.isArray(c)) return c;
  return null;
}

function asBool(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (v === 0 || v === "0" || v === "false") return false;
  if (v === 1 || v === "1" || v === "true") return true;
  return true;
}

function priceOf(o: any): number {
  const cands = [o.price, o.amount, o.monto, o.cost, o.precio, o.valor];
  for (const c of cands) if (c != null && !Number.isNaN(Number(c))) return Number(c);
  return 0;
}

function nameOf(o: any): string {
  const cands = [o.name, o.nombre, o.description, o.descripcion, o.title, o.titulo, o.serviceName];
  for (const c of cands) if (typeof c === "string" && c.trim()) return c.trim();
  return "—";
}

function mapList(arr: any[], source: CatalogItem["source"]): CatalogItem[] {
  return (arr ?? []).map((o) => ({
    id: o.id ?? o.code ?? o.key ?? o.uuid ?? `${source}:${Math.random()}`,
    name: nameOf(o),
    price: priceOf(o),
    active: asBool(o.active ?? o.enabled ?? o.status),
    source,
  }));
}

async function fetchCategory(cat: CatalogItem["source"], urls: string[], token?: string) {
  for (const u of urls) {
    const res = await tryJson(cat, u, token);
    if (res.ok) {
      const arr = pickArray(res.json);
      if (arr) return mapList(arr, cat);
    }
  }
  return [] as CatalogItem[];
}

// -------- Categorías ----------
export async function fetchProductsCombined(token?: string) {
  const base = apiBase();
  return fetchCategory("products", [
    `${base}/products`,
    `${base}/products/all`,
    `${base}/admin/products`,
  ], token);
}

export async function fetchMarketing(token?: string) {
  const base = apiBase();
  return fetchCategory("marketing", [
    `${base}/marketing`,
    `${base}/marketing/all`,
  ], token);
}

export async function fetchRecharges(token?: string) {
  const base = apiBase();
  return fetchCategory("recharges", [
    `${base}/recharges`,
    `${base}/recharges/all`,
  ], token);
}

export async function fetchLicenses(token?: string) {
  const base = apiBase();
  return fetchCategory("licenses", [
    `${base}/licenses/providers`,
    `${base}/license-providers`,
    `${base}/licenses`,
  ], token);
}

export async function fetchStreamingProviders(token?: string) {
  const base = apiBase();
  return fetchCategory("streaming", [
    `${base}/streaming/providers`,
    `${base}/streaming_provider`,
    `${base}/streaming`,
  ], token);
}

// -------- Combinado ----------
export async function listFullCatalog(token?: string): Promise<CatalogItem[]> {
  const [p, m, r, l, s] = await Promise.all([
    fetchProductsCombined(token),
    fetchMarketing(token),
    fetchRecharges(token),
    fetchLicenses(token),
    fetchStreamingProviders(token),
  ]);
  return [...p, ...m, ...r, ...l, ...s].sort((a, b) => a.name.localeCompare(b.name));
}

