'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { normalizeRole, roleLabel } from '@/app/lib/roles';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  KeyIcon, 
  PencilSquareIcon, 
  LockClosedIcon, 
  UserPlusIcon,
  UserGroupIcon,
  UserIcon,
  BanknotesIcon,
  ArrowPathIcon // Icono para Habilitar
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

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
  dni?: string;
  phone?: string;
  utility?: number;
  tariff?: string;
  createdAt?: string | Date;
};

type RoleOption = { code: string; label: string };

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(n ?? 0)
  );
}

function formatDateLike(value?: string | Date) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

/* Colores dinámicos para roles */
function getRoleClass(role: string | undefined) {
    const r = (normalizeRole(role) || 'CLIENT').toUpperCase();
    if (r === 'SUPERUSER' || r === 'ADMIN') return 'bg-red-500 text-white font-black';
    if (r === 'DISTRIBUTOR') return 'bg-blue-500 text-white font-bold';
    if (r === 'SUBDISTRIBUTOR') return 'bg-blue-100 text-blue-700 font-medium';
    if (r === 'TAQUILLA') return 'bg-green-100 text-green-700 font-medium';
    return 'bg-gray-100 text-gray-600 font-medium';
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

  // Cargar roles
  useEffect(() => {
    const go = async () => {
      try {
        const data = await api(`${API_BASE}/users/roles`, { headers: authHeader, cache: 'no-store' });
        const list = Array.isArray(data) ? data : data?.roles ?? [];
        setRoles(
          list.map((x: any) => {
            const code = x?.code ?? x?.value ?? x?.name ?? String(x);
            const label = x?.label ?? code;
            return { code: String(code).toUpperCase(), label: String(label) };
          })
        );
      } catch {}
    };
    go();
  }, [authHeader]);

  // Cargar Usuarios
  const load = useCallback(async () => {
    try {
      setLoading(true); setErr(null); setOk(null);

      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (onlyDisabled) params.set('disabled', 'true');
      if (onlyLocked) params.set('locked', 'true');
      const qs = params.toString();
      const path = `${API_BASE}/users${qs ? `?${qs}` : ''}`;

      const data = await api(path, { headers: authHeader, cache: 'no-store' });
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
        dni: x?.identificationCard ?? x?.dni ?? x?.document ?? x?.cedula ?? '',
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

  useEffect(() => { load(); }, [load]);

  // Filtrado de memoria
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
      setErr(null); setOk(null);
      setUsers((old) => old.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      await api(`${API_BASE}/users/${encodeURIComponent(String(id))}`, { method: 'PATCH', headers: authHeader, body: JSON.stringify(patch) });
      toast.success('Usuario actualizado.');
    } catch (e: any) {
      setUsers(prev);
      toast.error(e?.message ?? 'No se pudo actualizar el usuario');
    }
  }

  async function toggleDisabledUser(row: UserRow) {
    await updateUser(row.id, { disabled: !row.disabled });
  }
  async function toggleLockedUser(row: UserRow) {
    await updateUser(row.id, { locked: !row.locked });
  }
  async function resetPassword(row: UserRow) {
    if (!isSuper) return toast.error("Permiso denegado.");
    try {
      setErr(null); setOk(null);
      await api(`${API_BASE}/users/${encodeURIComponent(String(row.id))}/reset-password`, { method: 'POST', headers: authHeader });
      toast.success(`Se reseteó la clave de ${row.username}.`);
    } catch {
      toast.error('No se pudo resetear la clave');
    }
  }
  async function removeUser(row: UserRow) {
    if (!isSuper) return toast.error("Permiso denegado.");
    if (!confirm(`¿Eliminar a ${row.username}?`)) return;
    const prev = [...users];
    try {
      setUsers((old) => old.filter((u) => u.id !== row.id));
      await api(`${API_BASE}/users/${encodeURIComponent(String(row.id))}`, { method: 'DELETE', headers: authHeader });
      toast.success('Usuario eliminado.');
    } catch (e: any) {
      setUsers(prev);
      toast.error(e?.message ?? 'No se pudo eliminar');
    }
  }
  
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  /* =========================
     UI - RENDER
     ========================= */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* 1. HEADER Y CREAR USUARIO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             <UserGroupIcon className="w-7 h-7 text-[#E33127]" />
             Administración de Usuarios
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
             Total: {filtered.length} usuarios.
          </p>
        </div>
        
        <Link 
          href="/dashboard/users/create" 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E33127] text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          <UserPlusIcon className="w-5 h-5" />
          Crear Nuevo
        </Link>
      </div>

      <Toaster />
      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
      {ok && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</div>}

      {/* 2. FILTROS Y BÚSQUEDA (Responsivo) */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Buscador */}
        <div className="relative flex-grow min-w-[200px] max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por usuario, DNI, teléfono o email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
          />
        </div>

        {/* Filtro de Rol (Select más limpio) */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#E33127] outline-none transition-all text-sm font-medium text-slate-600"
          title="Filtrar por Rol"
        >
          <option value="ALL">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
        
        {/* Filtros Checkbox (Visibles pero discretos) */}
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-transparent px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={onlyDisabled} onChange={(e) => setOnlyDisabled(e.target.checked)} className="h-4 w-4 text-[#E33127] rounded border-gray-300 focus:ring-[#E33127]" />
          Inactivos
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-transparent px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={onlyLocked} onChange={(e) => setOnlyLocked(e.target.checked)} className="h-4 w-4 text-[#E33127] rounded border-gray-300 focus:ring-[#E33127]" />
          Bloqueados
        </label>
        
        {loading && <span className="text-sm text-slate-500 animate-pulse">Cargando...</span>}
      </div>

      {/* 3. TABLA DE USUARIOS (Responsiva con Grid Implícito) */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-100/50">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr className="text-xs uppercase tracking-wider">
              <th className="w-1/6 px-4 py-3 text-left">Usuario / Rol</th>
              <th className="w-1/5 px-4 py-3 text-left">Contacto / DNI</th>
              <th className="w-1/6 px-4 py-3 text-right">Saldo / Utilidad</th>
              <th className="w-1/6 px-4 py-3 text-left">Tarifa / Fecha</th>
              <th className="w-[10%] px-4 py-3 text-center">Estado</th>
              <th className="w-[15%] px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-400 font-medium">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                let stateLabel = 'Activo';
                let stateClass = 'bg-emerald-100 text-emerald-700';
                if (row.disabled) {
                  stateLabel = 'Inactivo';
                  stateClass = 'bg-gray-100 text-gray-600';
                } else if (row.locked) {
                  stateLabel = 'Bloqueado';
                  stateClass = 'bg-red-100 text-red-700';
                }

                return (
                  <tr key={String(row.id)} className="border-t border-slate-50 hover:bg-red-50/20 transition-colors align-top">
                    
                    {/* Usuario / Rol */}
                    <td className="px-4 py-3">
                       <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                           <UserIcon className="w-4 h-4 text-[#E33127]"/> {row.username}
                       </div>
                       <div className="mt-1">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${getRoleClass(row.role)}`}>
                              {roleLabel[normalizeRole(row.role)]}
                            </span>
                       </div>
                    </td>
                    
                    {/* Contacto / DNI */}
                    <td className="px-4 py-3">
                       <div className="text-xs text-slate-700 font-medium truncate">{row.email || '—'}</div>
                       <div className="text-xs text-slate-500 font-medium">{row.phone || row.dni || '—'}</div>
                    </td>
                    
                    {/* Saldo / Utilidad */}
                    <td className="px-4 py-3 text-right">
                        <div className="font-black text-sm text-slate-800 leading-tight">
                           {formatMoney(row.balance)}
                        </div>
                        <div className="text-xs text-green-700 font-bold">
                           {formatMoney(row.utility)}
                        </div>
                    </td>
                    
                    {/* Tarifa / Fecha */}
                    <td className="px-4 py-3">
                        <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600 w-fit mb-1">
                           {row.tariff || 'General'}
                        </div>
                        <div className="text-[10px] text-slate-500">{formatDateLike(row.createdAt)}</div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${stateClass}`}>
                            {stateLabel}
                        </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap gap-2 justify-center">
                        
                        {/* Editar Saldo/Datos (Pencil) */}
                        <button
                          onClick={() => setEditUser(row)}
                          className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Editar Saldo/Datos"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        
                        {/* Habilitar/Deshabilitar (Lock/Unlock) */}
                        <button
                          onClick={() => toggleDisabledUser(row)}
                          className={`p-2 rounded-full transition-colors ${row.disabled ? 'text-green-500 hover:bg-green-50' : 'text-slate-500 hover:bg-slate-50'}`}
                          title={row.disabled ? 'Habilitar usuario' : 'Deshabilitar/Bloquear'}
                        >
                          {row.disabled ? <ArrowPathIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                        </button>
                        
                        {/* Resetear Clave (Key) */}
                        <button
                          onClick={() => resetPassword(row)}
                          className="p-2 rounded-full text-amber-500 hover:bg-amber-50 transition-colors"
                          title="Resetear clave"
                        >
                          <KeyIcon className="w-5 h-5" />
                        </button>

                        {isSuper && (
                          <button
                            onClick={() => removeUser(row)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar permanentemente"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición Avanzada (Diseño Solicitado) */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg space-y-4 animate-in zoom-in-95">
            <h3 className="text-xl font-black">Editar {editUser.username}</h3>
            
            {/* Formulario de Saldo */}
            <form className='space-y-3'>
                <h4 className='text-sm font-bold text-slate-600'>Ajuste de Saldo (Simulación)</h4>
                <div className='relative'>
                    <BanknotesIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400'/>
                    <input 
                        type="number"
                        placeholder="Monto a sumar o restar (USD)"
                        className='w-full p-3 pl-10 rounded-xl border focus:border-blue-500 outline-none'
                    />
                </div>
                <div className='flex gap-2'>
                    <button type="button" className='flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors'>Sumar Saldo</button>
                    <button type="button" className='flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors'>Restar Saldo</button>
                </div>
            </form>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-bold hover:bg-gray-300">Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}








