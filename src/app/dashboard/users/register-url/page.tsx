// src/app/dashboard/users/register-url/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  creatableRolesFor,
  normalizeRole,
  roleLabel,
  Role,
} from "@/app/lib/roles";

/* ================= Helpers ================= */

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" ? t : null;
}

/** Dominio público de la app para armar el link de /Registro */
function publicBase(): string {
  try {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL || "") + "";
    if (raw) return raw.replace(/\/+$/, "");
    if (typeof window !== "undefined") return window.location.origin;
  } catch {}
  return "http://localhost:3000";
}

/** Base del API (si el backend ofrece endpoint para invitar) */
function apiBase(): string {
  try {
    const raw =
      (process.env.NEXT_PUBLIC_API_FULL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "") + "";
    return raw.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

/* ================= Types ================= */

type InviteResponse =
  | { url?: string; inviteUrl?: string; token?: string; expiresAt?: string | number }
  | null;

type FormState = {
  role: Role;
  owner: string; // id/username/email del admin/owner
  expiresHours: number; // caducidad en horas
  singleUse: boolean; // solo un uso
};

/* ================= Page ================= */

export default function UsersRegisterUrlPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);

  const currentUser: any = session?.user;
  const currentRole = useMemo(
    () => normalizeRole(currentUser?.role ?? currentUser?.rol),
    [currentUser]
  );

  // Roles que este usuario puede pre-asignar en la invitación
  const roleOptions = useMemo(
    () => creatableRolesFor(currentRole, { includeSelf: false }),
    [currentRole]
  );

  const [form, setForm] = useState<FormState>({
    role: roleOptions.includes("CLIENT") ? "CLIENT" : (roleOptions[0] ?? "CLIENT"),
    owner:
      String(
        currentUser?.id ??
          currentUser?.userId ??
          currentUser?.username ??
          currentUser?.email ??
          ""
      ),
    expiresHours: 48,
    singleUse: true,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultToken, setResultToken] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): string | null {
    if (!roleOptions.length)
      return "No autorizado: tu rol no puede generar enlaces de registro.";
    if (!form.owner.trim())
      return "Falta el identificador del owner/asignador (id o username).";
    if (!Number.isFinite(form.expiresHours) || form.expiresHours <= 0)
      return "Horas de caducidad inválidas (usa un número > 0).";
    return null;
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setOk(null);
    setResultUrl("");
    setResultToken("");

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const base = apiBase();
    const site = publicBase();

    try {
      const expiresAt = Date.now() + form.expiresHours * 60 * 60 * 1000;

      // 1) Intentar endpoints comunes que devuelvan url o token firmado
      const endpoints = [
        "/users/register-url",
        "/auth/register-url",
        "/invites",
        "/users/invite",
      ];

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
      };

      let invite: InviteResponse = null;

      if (base) {
        for (const ep of endpoints) {
          try {
            const res = await api(`${base}${ep}`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                role: form.role,           // rol preasignado
                owner: form.owner,         // dueño/administrador del cliente
                singleUse: form.singleUse, // un solo uso
                expiresAt,                 // timestamp (ms)
              }),
              signal,
            });
            invite = res as InviteResponse;
            if (invite?.url || invite?.inviteUrl || invite?.token) break;
          } catch {
            // probar el siguiente endpoint
          }
        }
      }

      // 2) Si el backend devolvió una URL, úsala
      if (invite?.url || invite?.inviteUrl) {
        const url = String(invite?.url || invite?.inviteUrl);
        setResultUrl(url);
        setOk("URL de registro generado (firmado por backend).");
        return;
      }

      // 3) Si devolvió un token, construye el link /Registro con token
      if (invite?.token) {
        const url = `${site}/Registro?token=${encodeURIComponent(invite.token)}`;
        setResultToken(invite.token);
        setResultUrl(url);
        setOk("URL de registro generado con token.");
        return;
      }

      // 4) Fallback sin backend: URL parametrizado (el backend debe validar en /Registro)
      const qs = new URLSearchParams({
        role: form.role,
        owner: form.owner,
        exp: String(expiresAt),
        once: String(form.singleUse ? 1 : 0),
      });
      const url = `${site}/Registro?${qs.toString()}`;
      setResultUrl(url);
      setOk(
        "URL de registro generado (sin token). Asegúrate de validar estos parámetros en el backend."
      );
    } catch (e: any) {
      setErr(e?.message || "No se pudo generar el enlace.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setOk("Copiado al portapapeles.");
    } catch {
      setErr("No se pudo copiar. Copia manualmente el texto mostrado.");
    }
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Si no tiene permiso para crear ningún rol, bloquea la vista
  if (!roleOptions.length) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
        <div className="mx-auto max-w-3xl section">
          <h1 className="text-xl md:text-2xl font-semibold mb-2">URL de registro</h1>
          <p className="text-slate-600 mb-4">
            Tu rol <span className="chip">{currentRole}</span> no puede generar enlaces de registro.
          </p>
          <Link href="/dashboard/users/list" className="btn btn-ghost">Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">URL de registro</h1>
          <Link href="/dashboard/users/list" className="btn btn-ghost">Volver</Link>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {ok}
          </div>
        )}

        <form onSubmit={onGenerate} className="section">
          <h2 className="form-title">Parámetros</h2>

          <div className="form-grid">
            <div>
              <label className="text-sm mb-1 block text-slate-600">Rol preasignado</label>
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
              <p className="form-help">Solo se muestran roles que tu perfil puede crear.</p>
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">
                Owner/Administrador (id/username/email)
              </label>
              <input
                className="input"
                value={form.owner}
                onChange={(e) => onChange("owner", e.target.value)}
                placeholder="ej. admin-id o admin@dominio.com"
              />
              <p className="form-help">
                Los clientes registrados quedan bajo un <b>ADMIN</b> (tu backend debe aplicarlo).
              </p>
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Caduca en (horas)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.expiresHours}
                onChange={(e) => onChange("expiresHours", Number(e.target.value || 1))}
                placeholder="48"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.singleUse}
                onChange={(e) => onChange("singleUse", e.target.checked)}
              />
              <span>Solo un uso</span>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button disabled={loading} className="btn btn-primary">
              {loading ? "Generando…" : "Generar URL"}
            </button>
            <Link href="/dashboard/users/list" className="btn btn-ghost">
              Cancelar
            </Link>
          </div>
        </form>

        {resultUrl && (
          <div className="mt-6 section">
            <h3 className="form-title">Resultado</h3>
            <div className="space-y-3">
              <div className="rounded-lg border bg-white p-3 text-sm break-all">
                <div className="mb-2 text-slate-500">URL</div>
                <div className="font-mono">{resultUrl}</div>
              </div>

              {resultToken ? (
                <div className="rounded-lg border bg-white p-3 text-sm break-all">
                  <div className="mb-2 text-slate-500">Token</div>
                  <div className="font-mono">{resultToken}</div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <button className="btn" onClick={() => copy(resultUrl)}>
                  Copiar URL
                </button>
                {resultToken ? (
                  <button className="btn btn-ghost" onClick={() => copy(resultToken)}>
                    Copiar token
                  </button>
                ) : null}
              </div>

              <p className="form-help">
                Comparte este enlace. Al abrir <code>/Registro</code>, tu backend debe validar el
                token o los parámetros y asignar el rol <b>{roleLabel[form.role]}</b> bajo el admin indicado.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
