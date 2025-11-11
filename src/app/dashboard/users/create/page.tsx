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

/* ================= Helpers ================= */

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

  const [form, setForm] = useState<FormState>({
    ...DEFAULTS,
    role: roleOptions.includes("CLIENT") ? "CLIENT" : (roleOptions[0] ?? "CLIENT"),
  });

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
        role: normalizedRole, // ← valor canónico que tu backend entiende
        password: form.password,
        disabled: !form.active, // muchos backends usan "disabled" inverso
      }; // ← aquí iba el error: debe cerrar con `};`

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
            try {
              created = await res.json();
            } catch {
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
              msg += `: ${
                j?.message || j?.error || j?.detail || (typeof j === "string" ? j : "")
              }`;
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
      router.replace("/dashboard/users/list");
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "No se pudo crear el usuario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!roleOptions.length) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
        <div className="mx-auto max-w-3xl section">
          <h1 className="text-xl md:text-2xl font-semibold mb-2">Crear cuenta</h1>
          <p className="text-slate-600 mb-4">
            Tu rol <span className="chip">{currentRole}</span> no tiene permisos para crear usuarios.
          </p>
          <Link href="/dashboard/users/list" className="btn btn-ghost">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const RoleInput = (
    <div>
      <label className="text-sm mb-1 block text-slate-600">Rol</label>
      <select
        className="input"
        value={form.role}
        onChange={(e) => onChange("role", normalizeRole(e.target.value))}
      >
        {roleOptions.map((r) => (
          <option key={r} value={r}>
            {roleLabel[r]}
          </option>
        ))}
      </select>
      <p className="form-help">
        Solo se muestran los roles que tu perfil puede crear, según la jerarquía.
      </p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <Link href="/dashboard/users/list" className="btn btn-ghost">
            Volver
          </Link>
        </div>

        {/* Mensajes */}
        {err && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {err}
          </div>
        )}
        {ok && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {ok}
          </div>
        )}

        <form onSubmit={onSubmit} className="section">
          <h2 className="form-title">Datos del usuario</h2>

          <fieldset className="form-grid" disabled={loading} aria-busy={loading}>
            <div>
              <label className="text-sm mb-1 block text-slate-600">Nombre</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Nombre completo"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Usuario</label>
              <input
                className="input"
                value={form.username}
                onChange={(e) => onChange("username", e.target.value)}
                placeholder="usuario"
                autoCapitalize="none"
                autoCorrect="off"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Correo</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="correo@dominio.com"
                required
                inputMode="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Teléfono</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+1 555 000 0000"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            {RoleInput}

            <div>
              <label className="text-sm mb-1 block text-slate-600">Contraseña</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="input"
                value={form.confirm}
                onChange={(e) => onChange("confirm", e.target.value)}
                placeholder="Repite la contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.active}
                onChange={(e) => onChange("active", e.target.checked)} // ← aquí quitamos el paréntesis extra
              />
              <span>Activo</span>
            </label>
          </fieldset>

          <div className="mt-6 flex gap-3">
            <button disabled={loading} className="btn btn-primary">
              {loading ? "Creando…" : "Crear usuario"}
            </button>
            <Link href="/dashboard/users/list" className="btn btn-ghost">
              Cancelar
            </Link>
          </div>

          <p className="form-help mt-4">
            Si el backend usa otra ruta, ajusta <code>apiBase()</code> y los endpoints en el submit.
          </p>
        </form>
      </div>
    </div>
  );
}




