// src/app/dashboard/users/create/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  creatableRolesFor,
  normalizeRole,
  roleLabel,
  Role,
} from "@/app/lib/roles";
import {
  UserPlusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  AtSymbolIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  PencilSquareIcon, // Usamos PencilSquareIcon para coherencia con otras vistas
  ShieldExclamationIcon 
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

/* ================= Helpers (Tu lógica de negocio es la prioridad) ================= */

/** Toma el token de la sesión (si existe) */
function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" ? t : null;
}

/** Base API: prioriza NEXT_PUBLIC_API_FULL y cae a NEXT_PUBLIC_API_BASE_URL. Sin slash final. */
function apiBase(): string {
  try {
    const raw =
      (process.env.NEXT_PUBLIC_API_FULL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "") + "";
    return raw.replace(/\/$/, "");
  } catch {
    return "";
  }
}

/* ================= Types & defaults ================= */

type FormState = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
  confirm: string;
  active: boolean;
};

const DEFAULTS: FormState = {
  name: "",
  username: "",
  email: "",
  phone: "",
  role: "CLIENT",
  password: "",
  confirm: "",
  active: true,
};

/* ================= Page ================= */

export default function UsersCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const token = useMemo(() => pickToken(session), [session]);
  const base = useMemo(() => apiBase(), []);
  const currentRole = useMemo(
    () => normalizeRole((session?.user as any)?.role),
    [session]
  );

  const roleOptions = useMemo(
    () => creatableRolesFor(currentRole),
    [currentRole]
  );

  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULTS,
    role: roleOptions.includes("CLIENT") ? "CLIENT" : (roleOptions[0] ?? "CLIENT"),
  }));

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): string | null {
    if (!roleOptions.length)
      return "No autorizado: tu rol no puede crear cuentas.";
    if (!form.name.trim() || !form.username.trim() || !form.email.trim())
      return "Nombre, usuario y correo son obligatorios.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
      return "Correo inválido.";
    if (!form.password || form.password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    if (form.password !== form.confirm) return "Las contraseñas no coinciden.";
    if (!base && !process.env.NEXT_PUBLIC_API_FULL)
      return "Falta configurar la URL del backend (NEXT_PUBLIC_API_FULL).";
    const isSameOrigin =
      typeof window !== "undefined" &&
      (!!base ? base.startsWith(window.location.origin) : true);
    if (!isSameOrigin && !token) return "No se encontró token de sesión.";
    const normalized = normalizeRole(form.role);
    if (!roleOptions.includes(normalized))
      return "No tienes permisos para asignar ese rol.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setOk(null);

    const v = validate();
    if (v) {
      setErr(v);
      toast.error(v);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    try {
      const normalizedRole = normalizeRole(form.role);

      const payload: any = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: normalizedRole,
        password: form.password,
        disabled: !form.active,
      };

      const isSameOrigin =
        typeof window !== "undefined" &&
        (!!base ? base.startsWith(window.location.origin) : true);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(isSameOrigin
          ? {}
          : {
              Authorization: token!.startsWith("Bearer ")
                ? token!
                : `Bearer ${token}`,
            }),
      };

      const endpoints = [
        "/api/admin/users",
        "/admin/users",
        "/users",
        "/auth/register",
      ];

      let created: any = null;
      let lastError = "";

      for (const ep of endpoints) {
        try {
          const res = await fetch(`${base}${ep}`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            cache: "no-store",
            signal,
          });

          if (res.ok) {
            try { created = await res.json(); } 
            catch {
              const txt = await res.text();
              created = { value: txt };
            }
            break;
          }

          let msg = `Error ${res.status} en ${ep}`;
          const txt = await res.text().catch(() => "");
          if (txt) {
            try {
              const j = JSON.parse(txt);
              msg += `: ${j?.message || j?.error || j?.detail || (typeof j === "string" ? j : "")}`;
            } catch {
              msg += `: ${txt.slice(0, 300)}`;
            }
          }
          lastError = msg;
        } catch (e: any) {
          if (e?.name === "AbortError") return; // cancelado
          lastError = `Fallo de red en ${ep}: ${e?.message || e}`;
        }
      }

      if (!created) {
        throw new Error(lastError || "No se pudo crear el usuario (URL/API/permisos).");
      }

      setOk("✅ Usuario creado correctamente.");
      toast.success("Usuario creado exitosamente.");
      router.replace("/dashboard/users/list");
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "No se pudo crear el usuario.");
      toast.error(e?.message || "Error al crear usuario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!roleOptions.length) {
    return (
      <div className="min-h-[calc(100vh-56px)] p-6 md:p-10 bg-slate-50"> {/* Fondo Base del Dashboard */}
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 shadow-md">
          <h1 className="text-xl md:text-2xl font-bold text-red-800 mb-3">
            <ShieldExclamationIcon className="w-6 h-6 inline mr-2" /> Permiso Denegado
          </h1>
          <p className="text-red-700 mb-4">
            Tu rol <span className="chip bg-red-100 text-red-800">{currentRole}</span> no tiene permisos para crear usuarios.
          </p>
          <Link href="/dashboard/users/list" className="flex items-center gap-2 text-sm text-red-600 hover:underline">
            <ArrowLeftIcon className="w-4 h-4" /> Volver a la lista
          </Link>
        </div>
      </div>
    );
  }
  
  // Clase de utilidad para el icono (Asegura el tamaño profesional y sutil)
  const ICON_CLASS = "pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127]";
  // Clase para Inputs de Formulario (Ultra Premium)
  const INPUT_CLASS = "w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-[#E33127] focus:ring-2 focus:ring-red-500/10 outline-none transition-all";


  const RoleInput = (
    <div className="md:col-span-2"> {/* Expandido para mejor visibilidad */}
      <label className="input-label text-slate-600" htmlFor="role">Rol a asignar</label>
      <div className="relative group"> 
        <WrenchScrewdriverIcon className={ICON_CLASS} />
        <select
          id="role"
          className={`${INPUT_CLASS} pl-10`} // Estilo de input consistente
          value={form.role}
          onChange={(e) => onChange("role", normalizeRole(e.target.value))}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r} className="bg-white text-slate-800">
              {roleLabel[r]}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Solo se muestran los roles que tu perfil puede crear, según la jerarquía.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen"> {/* Fondo Base del Dashboard */}
      <Toaster />
      
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlusIcon className="w-7 h-7 text-[#E33127]" />
            Crear Nuevo Usuario
        </h1>
        <Link href="/dashboard/users/list" className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#E33127] transition-colors font-medium">
          <ArrowLeftIcon className="w-4 h-4" /> Regresar
        </Link>
      </div>

      {/* Tarjeta del Formulario (BLANCA y ELEGANTE) */}
      <form onSubmit={onSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6">
          
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5 text-slate-500" />
            Detalles de Cuenta
          </h2>

          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4" disabled={loading} aria-busy={loading}>
            
            {/* Nombre Completo */}
            <div>
              <label className="input-label text-slate-600" htmlFor="name">Nombre Completo</label>
              <div className="relative group">
                <UserIcon className={ICON_CLASS} />
                <input
                  id="name"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="input-label text-slate-600" htmlFor="username">Nombre de Usuario</label>
              <div className="relative group">
                <AtSymbolIcon className={ICON_CLASS} />
                <input
                  id="username"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.username}
                  onChange={(e) => onChange("username", e.target.value)}
                  placeholder="usuario"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="input-label text-slate-600" htmlFor="email">Correo Electrónico</label>
              <div className="relative group">
                <EnvelopeIcon className={ICON_CLASS} />
                <input
                  id="email"
                  type="email"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="correo@dominio.com"
                  required
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="input-label text-slate-600" htmlFor="phone">Teléfono (opcional)</label>
              <div className="relative group">
                <PhoneIcon className={ICON_CLASS} />
                <input
                  id="phone"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
            </div>

            {RoleInput}

            {/* Contraseña */}
            <div>
              <label className="input-label text-slate-600" htmlFor="password">Contraseña</label>
              <div className="relative group">
                <KeyIcon className={ICON_CLASS} />
                <input
                  id="password"
                  type="password"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="input-label text-slate-600" htmlFor="confirm">Confirmar Contraseña</label>
              <div className="relative group">
                <KeyIcon className={ICON_CLASS} />
                <input
                  id="confirm"
                  type="password"
                  className={`${INPUT_CLASS} pl-10`}
                  value={form.confirm}
                  onChange={(e) => onChange("confirm", e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Campo Activo */}
            <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#E33127] focus:ring-[#E33127]"
                    checked={form.active}
                    onChange={(e) => onChange("active", e.target.checked)}
                  />
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500"/>
                  <span>
                    Activo (Permitir acceso al sistema de forma inmediata).
                  </span>
                </label>
            </div>
            
          </fieldset>

          {/* Botones de Acción */}
          <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
            <button 
              type="submit"
              disabled={loading} 
              // Botón de marca ROJO SOLIDO
              className="flex items-center gap-2 px-5 py-3 bg-[#E33127] text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Creando…" : "Crear Nuevo Usuario"}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <Link href="/dashboard/users/list" className="px-5 py-3 text-slate-600 rounded-xl hover:bg-slate-100 font-medium transition-colors border border-slate-200">
              Cancelar
            </Link>
          </div>

          <p className="form-help mt-4 text-xs text-slate-400">
            Nota: Si la creación falla, el sistema intentará varias rutas de API (admin/users, /users, /auth/register).
          </p>
      </form>
    </div>
  );
}