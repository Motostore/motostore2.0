// src/app/lib/products.service.ts (CÓDIGO CORREGIDO Y COMPLETO - PREMIUM ORO PRO+++)

type Json = Record<string, unknown> | unknown[];

/**
 * En SSR (server) construimos URLs absolutas con la URL pública del sitio,
 * y en el cliente usamos rutas relativas.
 * NO hay fallback a localhost para evitar confusiones.
 */
const BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "")
    : "";

// Si estamos en SSR y no tenemos BASE, lanzamos error claro de configuración.
if (typeof window === "undefined" && !BASE) {
  throw new Error(
    "Falta configurar NEXT_PUBLIC_SITE_URL (o NEXTAUTH_URL) con la URL pública del sitio."
  );
}

// Helper para fetch sin cache en SSR.
function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

/* ───── Productos (sub-rubros: accounts, licenses, marketing, recharges, etc.) ───── */

/** Obtiene un producto por id dentro de un sub-rubro */
export async function fetchProductById(id: string, productPath: string) {
  return api(`/api/products/${productPath}/${id}`);
}

/** Lista productos por tipo simple (sin paginar) */
export async function fetchProductsByType(type: string) {
  return api(`/api/products?type=${encodeURIComponent(type)}`);
}

/** Lista paginada por tipo */
export async function fetchPagedProductsByType(
  type: string,
  page = 1,
  pageSize = 10
) {
  const qs = new URLSearchParams({
    type,
    // 🛑 CORRECCIÓN: Convertir productPath (type) a string si es necesario para el query string
    page: String(page),
    pageSize: String(pageSize),
  });
  return api(`/api/products?${qs.toString()}`);
}

/** Crea un producto en la colección indicada por productPath */
export async function fetchCreateProduct(
  payload: Json, 
  productPath: string,
  token: string // 🛑 CORRECCIÓN: AÑADIR TOKEN (Resuelve TS2554 en formularios)
) {
  return api(`/api/products/${productPath}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Usar el token
    },
    cache: "no-store"
  });
}

/** Actualiza un producto por id en productPath */
export async function fetchUpdateProduct(
  id: string,
  payload: Json,
  productPath: string,
  token: string // 🛑 CORRECCIÓN: AÑADIR TOKEN
) {
  return api(`/api/products/${productPath}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Usar el token
    },
    cache: "no-store"
  });
}

/** Elimina un producto por id en productPath */
export async function fetchDeleteProduct(
    id: string | number, // 🛑 Tipar id para compatibilidad
    productPath: string,
    token: string // 🛑 CORRECCIÓN: AÑADIR TOKEN
) {
  return api(`/api/products/${productPath}/${id}`, { 
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Usar el token
      },
      cache: "no-store"
  });
}


/* 🛑 FUNCIÓN AÑADIDA PARA MYTABS.TSX (SOLUCIONA EL TS2305) 🛑 */
/**
 * Obtiene todos los productos de diferentes rubros en una sola llamada concurrente.
 * (Usado en MyTabs para poblar las galerías)
 */
export async function fetchAllProducts() {
  
  // Se ejecutan las 4 peticiones en paralelo para optimizar la carga
  // 🛑 Nota: Se debe consumir el .json() aquí, ya que el componente MyTabs asume que los resultados
  // son objetos listos para usar (streamings, licenses, etc.)
  const streamingPromise = fetchProductsByType('streaming').then(res => res.json());
  const licensesPromise = fetchProductsByType('licenses').then(res => res.json());
  const rechargesPromise = fetchProductsByType('recharges').then(res => res.json());
  const marketingPromise = fetchProductsByType('marketing').then(res => res.json());

  const [streamings, licenses, recharges, marketing] = await Promise.all([
    streamingPromise,
    licensesPromise,
    rechargesPromise,
    marketingPromise
  ]);

  return { streamings, licenses, recharges, marketing };
}


/* ───── Productos (genéricos) ───── */

/**
 * Crea un producto "general".
 * Esta función coincide con lo que importa /dashboard/products/new/page.tsx
 * y usa la ruta interna /api/products/create.
 */
export async function createProduct(payload: Json, token: string) { // 🛑 CORRECCIÓN: Añadir token
  return api(`/api/products/create`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Usar el token
    },
  });
}

/* ───── Categorías ───── */

/** Obtiene el listado de categorías */
export async function fetchCategories() {
  return api(`/api/products/categories`);
}

/** Crea una nueva categoría */
export async function createCategory(payload: Json, token: string) { // 🛑 CORRECCIÓN: Añadir token
  return api(`/api/products/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Usar el token
    },
  });
}

