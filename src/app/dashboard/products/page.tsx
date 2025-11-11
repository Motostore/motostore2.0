// src/app/dashboard/products/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { can } from '../../rbac/permissions';
import { listFullCatalog, type CatalogItem } from '../../lib/catalog';
import {
  adminCreateProduct,
  adminDeleteProduct,
} from '../../lib/admin.products';

/* =========================
   NUEVO: helpers para saldo/utilidades
   ========================= */
function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_FULL || process.env.API_BASE || '').replace(/\/$/, '');

async function tryFetchJSON(urls: string[], token?: string | null) {
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });
      if (!r.ok) continue;
      const txt = await r.text();
      try {
        return JSON.parse(txt);
      } catch {
        // Si responde texto, intenta número
        const num = Number(txt);
        if (!Number.isNaN(num)) return num;
      }
    } catch {
      // sigue probando
    }
  }
  return null;
}

function money(n: any) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(
    Number(n ?? 0)
  );
}

/* ======== País -> Proveedores (píldoras en Recargas) ======== */
const RECHARGE_MAP: Record<string, string[]> = {
  Venezuela: [
    'Movistar Prepago',
    'Movistar Pospago',
    'Movilnet Prepago',
    'Movilnet Pospago',
    'Digitel Prepago',
    'Digitel Pospago',
    'Cantv',
    'Inter',
    'Inter Pospago',
    'Simpletv',
  ],
  Colombia: [
    'Claro',
    'Directv',
    'Movistar',
    'Avantel',
    'Tigo',
    'Éxito',
    'Exito',
    'Virgin Mobile',
    'Flash Mobile',
    'ETB',
  ],
  Ecuador: ['Claro', 'Movistar', 'Directv', 'Tuenti', 'CNT', 'CNT TV'],
  Chile: [],
  Perú: [],
};
const RECHARGE_COUNTRIES = Object.keys(RECHARGE_MAP);

/* ============ Helpers existentes ============ */
function norm(s: any) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** intenta inferir el país a partir del nombre o item.country */
function inferRechargeCountry(item: CatalogItem): string | null {
  const name = norm(item.name);
  const anyItem = item as any;
  if (anyItem?.country) {
    const found = RECHARGE_COUNTRIES.find((c) => norm(c) === norm(anyItem.country));
    if (found) return found;
  }
  for (const country of RECHARGE_COUNTRIES) {
    for (const provider of RECHARGE_MAP[country]) {
      if (name.includes(norm(provider))) return country;
    }
  }
  return null;
}

/** devuelve el proveedor (exacto del mapa) si se detecta por el nombre */
function inferRechargeProvider(item: CatalogItem): string | null {
  const name = norm(item.name);
  for (const country of RECHARGE_COUNTRIES) {
    for (const provider of RECHARGE_MAP[country]) {
      if (!provider) continue;
      if (name.includes(norm(provider))) return provider;
    }
  }
  return null;
}

type Source =
  | 'all'
  | 'products'
  | 'marketing'
  | 'recharges'
  | 'licenses'
  | 'streaming'
  | 'exchange'
  | 'invoices';

const SOURCE_LABEL: Record<Exclude<Source, 'all'>, string> = {
  products: 'Productos',
  marketing: 'Marketing Digital',
  recharges: 'Recargas',
  licenses: 'Licencias',
  streaming: 'Streaming',
  exchange: 'Cambio',
  invoices: 'Facturas',
};
const DISPLAY_SOURCE = (s: Exclude<Source, 'all'>) => SOURCE_LABEL[s] ?? s;

/* =========================
   COMPONENTE
   ========================= */
export default function ProductsUnifiedPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const role = (session as any)?.user?.role;
  const canWrite = can(role, 'products:write') || can(role, '*' as any);

  // 👉 NUEVO: estados de resumen
  const [balance, setBalance] = useState<number | null>(null);
  const [utilitiesToday, setUtilitiesToday] = useState<number | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Productos (lo que ya tenías)
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [source, setSource] = useState<Source>('all');
  const [q, setQ] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  const [rechargeCountry, setRechargeCountry] = useState<'all' | string>('all');
  const [rechargeProvider, setRechargeProvider] = useState<'all' | string>('all');

  const [createSource, setCreateSource] = useState<
    'marketing' | 'recharges' | 'licenses' | 'streaming' | 'exchange' | 'invoices'
  >('marketing');

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [active, setActive] = useState(true);

  /* =========================
     NUEVO: carga de saldo y utilidades (probando varios endpoints)
     ========================= */
  useEffect(() => {
    if (!API_BASE) return; // si falta, no intenta
    (async () => {
      try {
        setLoadingSummary(true);

        // Endpoints probables para SALDO
        const balanceUrls = [
          `${API_BASE}/wallet/me/balance`,
          `${API_BASE}/wallet/balance`,
          `${API_BASE}/wallet/me`,
          `${API_BASE}/users/me/wallet`,
          `${API_BASE}/account/wallet`,
        ];

        // Endpoints probables para UTILIDADES (hoy)
        const utilUrls = [
          `${API_BASE}/reports/me/utilities?period=today`,
          `${API_BASE}/reports/utilities?period=today`,
          `${API_BASE}/reports/utilities/today`,
          `${API_BASE}/reports/me/profit?period=today`,
        ];

        const b = await tryFetchJSON(balanceUrls, token);
        const u = await tryFetchJSON(utilUrls, token);

        // Distintos formatos posibles:
        const parsedBalance =
          typeof b === 'number'
            ? b
            : b?.balance ?? b?.saldo ?? b?.wallet?.balance ?? null;

        const parsedUtilities =
          typeof u === 'number'
            ? u
            : u?.today ?? u?.utilities ?? u?.profit ?? u?.utilidades ?? null;

        if (parsedBalance != null) setBalance(Number(parsedBalance));
        if (parsedUtilities != null) setUtilitiesToday(Number(parsedUtilities));
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, [token]);

  /* =========================
     Carga de productos (lo tuyo)
     ========================= */
  async function load() {
    try {
      setLoading(true);
      setErr(null);
      setOk(null);
      const all = (await listFullCatalog(token ?? undefined)).map((it) => {
        const s = norm((it as any).source);
        if (s === 'invoice') return { ...it, source: 'invoices' as any };
        return it;
      });
      setItems(all);
    } catch (e: any) {
      setErr(e?.message ?? 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // reset subfiltros cuando cambias de pestaña
  useEffect(() => {
    if (source !== 'recharges') {
      setRechargeCountry('all');
      setRechargeProvider('all');
    }
  }, [source]);
  useEffect(() => {
    setRechargeProvider('all');
  }, [rechargeCountry]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const k of Object.keys(SOURCE_LABEL) as Array<keyof typeof SOURCE_LABEL>) {
      c[k] = items.filter((r) => r.source === k).length;
    }
    return c;
  }, [items]);

  const rechargeCounts = useMemo(() => {
    const recs = items.filter((r) => r.source === 'recharges');
    const bag: Record<string, number> = {};
    for (const row of recs) {
      const country = inferRechargeCountry(row) ?? 'Otros';
      bag[country] = (bag[country] ?? 0) + 1;
    }
    for (const c of RECHARGE_COUNTRIES) bag[c] = bag[c] ?? 0;
    return bag;
  }, [items]);

  const providerCounts = useMemo(() => {
    if (rechargeCountry === 'all') return {};
    const recs = items.filter((r) => r.source === 'recharges');
    const recsByCountry = recs.filter(
      (r) => (inferRechargeCountry(r) ?? 'Otros') === rechargeCountry
    );
    const bag: Record<string, number> = {};
    for (const row of recsByCountry) {
      const p = inferRechargeProvider(row) ?? 'Otros';
      bag[p] = (bag[p] ?? 0) + 1;
    }
    for (const p of RECHARGE_MAP[rechargeCountry] ?? []) bag[p] = bag[p] ?? 0;
    return bag;
  }, [items, rechargeCountry]);

  const orderedTabs: Source[] = useMemo(() => {
    const keys = Object.keys(SOURCE_LABEL) as Exclude<Source, 'all'>[];
    keys.sort((a, b) =>
      SOURCE_LABEL[a].localeCompare(SOURCE_LABEL[b], 'es', { sensitivity: 'base' })
    );
    return ['all', ...keys] as Source[];
  }, []);

  const filtered = useMemo(() => {
    let data = items;
    if (source !== 'all') data = data.filter((r) => r.source === source);

    if (source === 'recharges' && rechargeCountry !== 'all') {
      data = data.filter((r) => (inferRechargeCountry(r) ?? 'Otros') === rechargeCountry);

      if (rechargeProvider !== 'all') {
        data = data.filter((r) => (inferRechargeProvider(r) ?? 'Otros') === rechargeProvider);
      }
    }

    if (q.trim()) {
      const w = norm(q.trim());
      data = data.filter(
        (r) =>
          norm(r.name).includes(w) ||
          String(r.id).toLowerCase().includes(w) ||
          norm(r.source ?? '').includes(w)
      );
    }

    return [...data].sort((a, b) => norm(a.name).localeCompare(norm(b.name), 'es'));
  }, [items, source, q, rechargeCountry, rechargeProvider]);

  function resetForm() {
    setEditingId(null);
    setName('');
    setPrice('');
    setActive(true);
  }

  function startCreate() {
    resetForm();
    setPanelOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEdit(row: CatalogItem) {
    if (row.source !== 'products' || !canWrite) return;
    setEditingId(row.id);
    setName(row.name);
    setPrice(row.price as number);
    setActive(Boolean(row.active));
    setPanelOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    if (!name.trim() || String(price).trim() === '') return;

    try {
      setLoading(true);
      setErr(null);
      setOk(null);

      if (editingId != null) {
        setErr('Edición solo disponible para "Productos" en esta versión.');
        return;
      }

      if (createSource === 'invoices') {
        await (adminCreateProduct as any)(
          { name: name.trim(), price: Number(price), active: Boolean(active), source: 'invoices' },
          token ?? undefined
        );

        setOk('Factura creada correctamente.');
        setPanelOpen(false);
        resetForm();
        await load();
        return;
      }

      setErr(
        'Esta categoría es de solo lectura por ahora. Creación habilitada únicamente en "Facturas".'
      );
    } catch {
      const temp = {
        id: `local_${Date.now()}`,
        name: name.trim(),
        price: Number(price),
        active: Boolean(active),
        source: 'invoices',
      } as unknown as CatalogItem;

      setItems((prev) => [temp, ...prev]);
      setOk('No pude guardar en el backend. La factura se agregó SOLO localmente.');
      setPanelOpen(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(row: CatalogItem) {
    if (row.source !== 'products' || !canWrite) return;
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      setLoading(true);
      setErr(null);
      setOk(null);
      await adminDeleteProduct(row.id, token ?? undefined);
      setOk('Producto eliminado.');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Error eliminando producto');
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="mx-auto max-w-7xl p-4">

      {/* ======= NUEVO: Resumen superior ======= */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-semibold text-slate-800">💵 Saldo</div>
            <div className="text-slate-600 text-xs">Disponible en tu wallet</div>
          </div>
          <div className="text-right text-lg font-semibold">
            {loadingSummary ? '…' : balance != null ? money(balance) : '—'}
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-semibold text-slate-800">🚀 Utilidades (hoy)</div>
            <div className="text-slate-600 text-xs">Ganancia neta del día</div>
          </div>
          <div className="text-right text-lg font-semibold">
            {loadingSummary ? '…' : utilitiesToday != null ? money(utilitiesToday) : '—'}
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-semibold text-slate-800">🛍️ Productos</div>
            <div className="text-slate-600 text-xs">Total en catálogo</div>
          </div>
          <div className="text-right text-lg font-semibold">
            {items.length}
          </div>
        </div>
      </div>
      {/* ======= /Resumen superior ======= */}

      {/* Título + Acciones */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <div className="ml-auto flex items-center gap-2">
          {canWrite && (
            <button
              onClick={startCreate}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Nuevo producto
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Recargar'}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {err && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {ok && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {ok}
        </div>
      )}

      {/* Panel de creación/edición */}
      {panelOpen && canWrite && (
        <form
          onSubmit={onSubmit}
          className="mb-6 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">
              {editingId == null ? 'Crear elemento' : `Editar producto #${editingId}`}
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setPanelOpen(false);
              }}
              className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Selector de categoría (incluye Facturas) */}
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Categoría</span>
              <select
                value={createSource}
                onChange={(e) =>
                  setCreateSource(
                    e.target.value as
                      | 'marketing'
                      | 'recharges'
                      | 'licenses'
                      | 'streaming'
                      | 'exchange'
                      | 'invoices'
                  )
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="marketing">Marketing</option>
                <option value="recharges">Recargas</option>
                <option value="licenses">Licencias</option>
                <option value="streaming">Streaming</option>
                <option value="exchange">Cambio</option>
                <option value="invoices">Facturas</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Precio (USD)</span>
              <input
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Activo</span>
            </label>

            <div className="sm:col-span-2 md:col-span-1">
              <button
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {editingId == null ? 'Crear' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabs + búsqueda (píldoras) */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {orderedTabs.map((key) => {
            const isActive = source === key;
            const label =
              key === 'all' ? 'Todos' : SOURCE_LABEL[key as Exclude<Source, 'all'>];
            const n = counts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setSource(key)}
                aria-pressed={isActive}
                className={`pill ${isActive ? 'pill-active' : ''}`}
              >
                {label} <span className="pill-badge">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, ID u origen…"
              className="w-72 rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>
          </div>
        </div>
      </div>

      {/* Subfiltro por país y proveedor cuando estás en Recargas */}
      {source === 'recharges' && (
        <>
          {/* Países */}
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              className={`pill ${rechargeCountry === 'all' ? 'pill-active' : ''}`}
              onClick={() => setRechargeCountry('all')}
            >
              Todos <span className="pill-badge">{counts.recharges ?? 0}</span>
            </button>
            {RECHARGE_COUNTRIES.map((c) => (
              <button
                key={c}
                className={`pill ${rechargeCountry === c ? 'pill-active' : ''}`}
                onClick={() => setRechargeCountry(c)}
              >
                {c}{' '}
                <span className="pill-badge">
                  {rechargeCounts[c] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Proveedores */}
          {rechargeCountry !== 'all' && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                className={`pill ${rechargeProvider === 'all' ? 'pill-active' : ''}`}
                onClick={() => setRechargeProvider('all')}
              >
                Todos{' '}
                <span className="pill-badge">
                  {rechargeCounts[rechargeCountry] ?? 0}
                </span>
              </button>

              {(RECHARGE_MAP[rechargeCountry] ?? []).map((p) => (
                <button
                  key={p}
                  className={`pill ${rechargeProvider === p ? 'pill-active' : ''}`}
                  onClick={() => setRechargeProvider(p)}
                >
                  {p}{' '}
                  <span className="pill-badge">
                    {providerCounts[p] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Origen</th>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-left">Activo</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Sin datos.
                </td>
              </tr>
            )}

            {filtered.map((row) => {
              const isProducts = row.source === 'products';
              const sourceLabel = DISPLAY_SOURCE(row.source as Exclude<Source, 'all'>);
              return (
                <tr key={`${row.source}:${row.id}`} className="border-t">
                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        isProducts
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700',
                      ].join(' ')}
                    >
                      {sourceLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2">{String(row.id)}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 text-right">{money(row.price)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-block rounded-full px-2 py-0.5 text-xs',
                        row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600',
                      ].join(' ')}
                    >
                      {row.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {isProducts && canWrite ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(row)}
                          className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-md border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


















