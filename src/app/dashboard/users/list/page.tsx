// src/app/dashboard/users/list/page.tsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { normalizeRole, roleLabel } from '@/app/lib/roles';

/* =========================
   Tipos / helpers
   ========================= */
type UserRow = {
  id: number | string;
  username: string;
  name?: string;
  email?: string;
  role?: string;
  locked?: boolean;
  disabled?: boolean;
  balance?: number;
  parent?: string | number | null;

  // columnas extra
  dni?: string;
  phone?: string;
  utility?: number;            // Utilidades
  tariff?: string;             // Tarifa
  createdAt?: string | Date;   // Fecha
};

type RoleOption = { code: string; label: string };

/** 💡 Usa la base de tu API; si no está, cae a localhost */
const API_BASE = (process.env.NEXT_PUBLIC_API_FULL ?? 'http://localhost:8080/api/v1').replace(/\/+$/,'');

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

function formatMoney(n: any) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(
    Number(n ?? 0)
  );
}

function formatDateLike(value?: string | Date) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return '—';
  }
}

/* =========================
   Página
   ========================= */
export default function UsersListPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const u: any = session?.user;
  const currentRole = normalizeRole(u?.role ?? u?.rol);
  const isSuper =
    currentRole === 'SUPERUSER' ||
    (!currentRole && String(u?.username ?? u?.name).toLowerCase() === 'superuser');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [onlyDisabled, setOnlyDisabled] = useState(false);
  const [onlyLocked, setOnlyLocked] = useState(false);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  // Cargar roles (para el selector)
  useEffect(() => {
    const go = async () => {
      try {
        const data = await api(`${API_BASE}/users/roles`, {
          headers: authHeader,
          cache: 'no-store',
        });
        const list = Array.isArray(data) ? data : data?.roles ?? [];
        setRoles(
          list.map((x: any) => {
            const code = x?.code ?? x?.value ?? x?.name ?? String(x);
            const label = x?.label ?? code;
            return { code: String(code).toUpperCase(), label: String(label) };
          })
        );
      } catch {
        // silencio: si falla, igual mostramos el texto del rol normalizado
      }
    };
    go();
  }, [authHeader]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      setOk(null);

      // Si decides que el backend filtre, activa estas líneas y el useEffect de filtros
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (onlyDisabled) params.set('disabled', 'true');
      if (onlyLocked) params.set('locked', 'true');
      const qs = params.toString();
      const path = `${API_BASE}/users${qs ? `?${qs}` : ''}`;

      const data = await api(path, {
        headers: authHeader,
        cache: 'no-store',
      });

      const list = Array.isArray(data) ? data : data?.content ?? data?.items ?? [];

      const norm: UserRow[] = list.map((x: any) => ({
        id: x?.id ?? x?.userId ?? x?.username ?? x?.name,
        username: x?.username ?? x?.name ?? '',
        name: x?.name ?? '',
        email: x?.email ?? '',
        role: normalizeRole(x?.role ?? x?.rol),
        locked: Boolean(x?.locked),
        disabled: Boolean(x?.disabled),
        balance: Number(x?.balance ?? x?.saldo ?? 0),
        parent: x?.parent ?? x?.parentId ?? null,

        dni:
          x?.identificationCard ??
          x?.identification_card ??
          x?.dni ??
          x?.document ??
          x?.cedula ??
          '',

        phone: x?.phone ?? x?.mobile ?? x?.whatsapp ?? x?.telefono ?? '',

        utility: Number(x?.utility ?? x?.utilidad ?? 0),
        tariff: x?.tariff ?? x?.rate ?? x?.plan ?? x?.tarifa ?? 'General',
        createdAt: x?.createdAt ?? x?.created_at ?? x?.created ?? x?.joinedAt ?? x?.date,
      }));

      setUsers(norm);
    } catch (e: any) {
      setErr(e?.message ?? 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  }, [authHeader, q, roleFilter, onlyDisabled, onlyLocked]);

  // Carga inicial + recarga cuando cambian filtros/búsqueda
  useEffect(() => {
    load();
  }, [load]);

  // Si quieres filtrar SOLO en memoria, comenta el useEffect de arriba y deja este memo:
  const filtered = useMemo(() => {
    let data = [...users];
    if (roleFilter !== 'ALL') data = data.filter((u) => normalizeRole(u.role) === roleFilter);
    if (onlyDisabled) data = data.filter((u) => u.disabled);
    if (onlyLocked) data = data.filter((u) => u.locked);
    if (q.trim()) {
      const w = q.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.username.toLowerCase().includes(w) ||
          (r.name ?? '').toLowerCase().includes(w) ||
          (r.email ?? '').toLowerCase().includes(w) ||
          (r.dni ?? '').toLowerCase().includes(w) ||
          (r.phone ?? '').toLowerCase().includes(w) ||
          String(r.id).toLowerCase().includes(w),
      );
    }
    return data.sort((a, b) => String(a.username).localeCompare(String(b.username)));
  }, [users, roleFilter, onlyDisabled, onlyLocked, q]);

  /* =========================
     Acciones por fila
     ========================= */
  async function updateUser(id: UserRow['id'], patch: Partial<UserRow>) {
    const prev = [...users];
    try {
      setErr(null);
      setOk(null);
      setUsers((old) => old.map((u) => (u.id === id ? { ...u, ...patch } : u)));

      await api(`${API_BASE}/users/${encodeURIComponent(String(id))}`, {
        method: 'PATCH',
        headers: authHeader,
        body: JSON.stringify(patch),
      });

      setOk('Usuario actualizado.');
    } catch (e: any) {
      setUsers(prev);
      setErr(e?.message ?? 'No se pudo actualizar el usuario');
    }
  }

  async function changeRole(id: UserRow['id'], role: string) {
    if (!isSuper) return;
    await updateUser(id, { role });
  }
  async function toggleDisabledUser(row: UserRow) {
    await updateUser(row.id, { disabled: !row.disabled });
  }
  async function toggleLockedUser(row: UserRow) {
    await updateUser(row.id, { locked: !row.locked });
  }
  async function resetPassword(row: UserRow) {
    try {
      setErr(null);
      setOk(null);
      await api(`${API_BASE}/users/${encodeURIComponent(String(row.id))}/reset-password`, {
        method: 'POST',
        headers: authHeader,
      });
      setOk(`Se reseteó la clave de ${row.username}.`);
    } catch {
      try {
        await api(`${API_BASE}/users/${encodeURIComponent(String(row.id))}`, {
          method: 'PATCH',
          headers: authHeader,
          body: JSON.stringify({ password: '123456' }),
        });
        setOk(`Se estableció una clave temporal para ${row.username}.`);
      } catch (e: any) {
        setErr(e?.message ?? 'No se pudo resetear la clave');
      }
    }
  }
  async function removeUser(row: UserRow) {
    if (!isSuper) return;
    if (!confirm(`¿Eliminar al usuario "${row.username}"? Esta acción no se puede deshacer.`)) return;
    const prev = [...users];
    try {
      setUsers((old) => old.filter((u) => u.id !== row.id));
      await api(`${API_BASE}/users/${encodeURIComponent(String(row.id))}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      setOk('Usuario eliminado.');
    } catch (e: any) {
      setUsers(prev);
      setErr(e?.message ?? 'No se pudo eliminar');
    }
  }

  /* =========================
     UI
     ========================= */
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Lista de usuarios</h1>
        <p className="text-sm text-slate-600">Listado y búsqueda de usuarios.</p>
      </div>

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

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por usuario, nombre, DNI, teléfono, email o ID…"
            className="input w-80 pl-9"
          />
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select"
          title="Rol"
        >
          <option value="ALL">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={onlyDisabled}
            onChange={(e) => setOnlyDisabled(e.target.checked)}
          />
          Solo deshabilitados
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={onlyLocked}
            onChange={(e) => setOnlyLocked(e.target.checked)}
          />
          Solo bloqueados
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">DNI</th>
              <th className="px-3 py-2 text-left">Teléfono</th>
              <th className="px-3 py-2 text-left">Correo</th>
              <th className="px-3 py-2 text-right">Saldo</th>
              <th className="px-3 py-2 text-right">Utilidades</th>
              <th className="px-3 py-2 text-left">Tarifa</th>
              <th className="px-3 py-2 text-left">Estados</th>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-gray-500">
                  Sin datos.
                </td>
              </tr>
            )}

            {filtered.map((row) => {
              let stateLabel = 'ACTIVO';
              let stateClass = 'bg-emerald-50 text-emerald-700';
              if (row.disabled) {
                stateLabel = 'INACTIVO';
                stateClass = 'bg-gray-100 text-gray-600';
              } else if (row.locked) {
                stateLabel = 'BLOQUEADO';
                stateClass = 'bg-red-50 text-red-700';
              }

              return (
                <tr key={String(row.id)} className="border-t align-middle">
                  <td className="px-3 py-2 text-gray-700">{String(row.id)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-800">{row.username}</div>
                  </td>
                  <td className="px-3 py-2">{row.name || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-2">{row.dni || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-2">{row.phone || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-2">{row.email || <span className="text-gray-400">—</span>}</td>

                  <td className="px-3 py-2 text-right">{formatMoney(row.balance)}</td>
                  <td className="px-3 py-2 text-right">
                    {row.utility == null ? '—' : formatMoney(row.utility)}
                  </td>

                  <td className="px-3 py-2">
                    <span className="chip">{row.tariff || 'General'}</span>
                  </td>

                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${stateClass}`}>
                      {stateLabel}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    {isSuper ? (
                      <select
                        className="input"
                        value={normalizeRole(row.role) || ''}
                        onChange={(e) => changeRole(row.id, e.target.value)}
                      >
                        <option value="">(sin rol)</option>
                        {roles.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="chip" title={row.role}>
                        {roleLabel[normalizeRole(row.role)]}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">{formatDateLike(row.createdAt)}</td>

                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleDisabledUser(row)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        title={row.disabled ? 'Habilitar' : 'Deshabilitar'}
                      >
                        {row.disabled ? 'Habilitar' : 'Deshabilitar'}
                      </button>
                      <button
                        onClick={() => toggleLockedUser(row)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        title={row.locked ? 'Desbloquear' : 'Bloquear'}
                      >
                        {row.locked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button
                        onClick={() => resetPassword(row)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        title="Resetear clave (temporal)"
                      >
                        Reset clave
                      </button>

                      {isSuper && (
                        <button
                          onClick={() => removeUser(row)}
                          className="rounded-md border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
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









