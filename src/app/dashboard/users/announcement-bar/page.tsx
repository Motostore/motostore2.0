// src/app/dashboard/users/announcement-bar/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Role,
  Roles,
  normalizeRole,
  roleLabel,
  atLeastRole,
} from "@/app/lib/roles";

/* ================= Helpers ================= */

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" ? t : null;
}

/** Base del API (sin slash final) */
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

type Variant = "info" | "success" | "warning" | "error" | "neutral";

/** Alcance “dueño”:
 *  - "ALL": (ADMIN/SUPERUSER) impacta a todo el sistema
 *  - "OWN_TREE": (DISTRIBUTOR/RESELLER) se limita a su árbol/descendencia
 */
type OwnerScope = "ALL" | "OWN_TREE";

type Announcement = {
  id?: string | number | null;
  message: string;
  variant: Variant;
  active: boolean;
  dismissible: boolean;
  linkUrl: string;

  /** Destinatarios por rol:
   *  - "ALL": todos los roles
   *  - Role[]: roles seleccionados
   */
  audience: Role[] | "ALL";

  /** Propagar a descendientes del/los roles seleccionados */
  includeDescendants: boolean;

  /** Alcance por dueño/emisor (ver doc arriba) */
  ownerScope: OwnerScope;

  /** Para limitar por “quién publica” en el backend */
  ownerId?: string | number | null;

  startsAt?: string | null; // ISO compatible con <input type="datetime-local"> (sin zona)
  endsAt?: string | null;   // ISO compatible con <input type="datetime-local">
};

const DEFAULT: Announcement = {
  id: null,
  message: "",
  variant: "info",
  active: true,
  dismissible: true,
  linkUrl: "",
  audience: "ALL",
  includeDescendants: true,
  ownerScope: "ALL",
  ownerId: null,
  startsAt: null,
  endsAt: null,
};

const VARIANT_STYLE: Record<Variant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

/** Endpoints comunes (ajusta a tu backend) */
const GET_ENDPOINTS = [
  "/users/announcement-bar",
  "/announcement-bar",
  "/admin/announcement",
  "/settings/announcement",
];

const SAVE_ENDPOINTS = [
  "/users/announcement-bar",
  "/announcement-bar",
  "/admin/announcement",
  "/settings/announcement",
];

/** YYYY-MM-DDTHH:mm (local) desde Date/ISO/number */
function toLocalInput(dt?: string | number | Date | null): string {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** ISO desde valor local */
function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Normaliza cualquier payload del backend a nuestro Announcement */
function normalizeResponse(x: any, fallback: Partial<Announcement> = {}): Announcement {
  if (!x || typeof x !== "object") return { ...DEFAULT, ...fallback };

  // audience
  const audienceRaw = x.audience ?? x.roles ?? x.visibleFor ?? x.scope ?? null;
  let audience: Announcement["audience"] = "ALL";
  if (Array.isArray(audienceRaw)) {
    const arr = audienceRaw.map((r: any) => normalizeRole(r));
    audience = arr.length ? (arr as Role[]) : "ALL";
  } else if (typeof audienceRaw === "string") {
    audience = audienceRaw.toUpperCase() === "ALL" ? "ALL" : [normalizeRole(audienceRaw)];
  } else {
    audience = fallback.audience ?? "ALL";
  }

  return {
    id: x.id ?? x._id ?? fallback.id ?? null,
    message: x.message ?? x.text ?? x.body ?? fallback.message ?? "",
    variant: (x.variant ?? x.type ?? x.style ?? fallback.variant ?? "info") as Variant,
    active: Boolean(x.active ?? x.enabled ?? fallback.active ?? true),
    dismissible: Boolean(x.dismissible ?? x.canClose ?? fallback.dismissible ?? true),
    linkUrl: x.linkUrl ?? x.url ?? fallback.linkUrl ?? "",
    audience,
    includeDescendants: Boolean(
      x.includeDescendants ?? x.hierarchical ?? x.propagate ?? fallback.includeDescendants ?? true
    ),
    ownerScope: (x.ownerScope ?? x.scopeOwner ?? fallback.ownerScope ?? "ALL") as OwnerScope,
    ownerId: x.ownerId ?? x.owner ?? x.createdBy ?? fallback.ownerId ?? null,
    startsAt: toLocalInput(x.startsAt ?? x.startAt ?? x.start ?? x.from ?? fallback.startsAt ?? null),
    endsAt: toLocalInput(x.endsAt ?? x.endAt ?? x.end ?? x.until ?? fallback.endsAt ?? null),
  };
}

/* ================= Page ================= */

export default function UsersAnnouncementBarPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const base = useMemo(() => apiBase(), []);
  const me: any = session?.user;

  const myRole = useMemo(() => normalizeRole(me?.role ?? me?.rol), [me]);
  const myId = useMemo(
    () => me?.id ?? me?.userId ?? me?.username ?? me?.email ?? null,
    [me]
  );

  // Permisos: solo ADMIN / SUPERUSER editan global;
  // DISTRIBUTOR / RESELLER pueden emitir sobre su propio árbol.
  const canEdit = atLeastRole(myRole, "RESELLER"); // RESELLER, DISTRIBUTOR, ADMIN, SUPERUSER
  const isGlobalAdmin = atLeastRole(myRole, "ADMIN");

  const [form, setForm] = useState<Announcement>(() =>
    normalizeResponse({}, {
      ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
      ownerId: myId ?? null,
      audience: "ALL",
      includeDescendants: true,
    })
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof Announcement>(k: K, v: Announcement[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function loadCurrent() {
    setErr(null);
    setOk(null);
    const headers = token
      ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` }
      : undefined;

    // intenta varios endpoints hasta que alguno responda
    for (const ep of GET_ENDPOINTS) {
      try {
        const data = await api(`${base}${ep}`, { headers });
        const item = (Array.isArray(data) ? (data[0] ?? null) : data?.data ?? data) ?? null;
        if (item) {
          const norm = normalizeResponse(item, {
            ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
            ownerId: myId ?? null,
          });
          setForm(norm);
          return;
        }
      } catch {
        // probar el siguiente
      }
    }
    // si ninguno respondió, deja por defecto con ownerScope según rol
    setForm((f) => ({
      ...f,
      ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
      ownerId: myId ?? null,
    }));
  }

  function validate(): string | null {
    if (!canEdit) return "No autorizado. Tu rol no puede gestionar la barra.";
    if (!form.message.trim()) return "El mensaje es obligatorio.";
    if (!["info", "success", "warning", "error", "neutral"].includes(form.variant)) {
      return "Tipo inválido.";
    }
    if (form.startsAt && form.endsAt) {
      const a = new Date(form.startsAt);
      const b = new Date(form.endsAt);
      if (a.getTime() > b.getTime()) return "El rango de fechas es inválido (inicio > fin).";
    }
    if (form.audience !== "ALL" && (!Array.isArray(form.audience) || form.audience.length === 0)) {
      return "Selecciona al menos un rol destinatario o elige 'Todos'.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const v = validate();
    if (v) {
      setErr(v);
      setOk(null);
      return;
    }

    setLoading(true);
    setErr(null);
    setOk(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
    };

    // payload canónico con campos para jerarquía
    const payload = {
      id: form.id ?? undefined,
      message: form.message.trim(),
      variant: form.variant,
      active: form.active,
      dismissible: form.dismissible,
      linkUrl: form.linkUrl || null,

      audience: form.audience === "ALL" ? "ALL" : (form.audience as Role[]),
      includeDescendants: Boolean(form.includeDescendants),

      ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
      ownerId: myId ?? null,

      startsAt: fromLocalInput(form.startsAt || ""),
      endsAt: fromLocalInput(form.endsAt || ""),
    };

    let saved = false;
    let lastError = "";

    for (const ep of SAVE_ENDPOINTS) {
      try {
        const res = await api(`${base}${ep}`, {
          method: "POST", // ajusta a PUT/PATCH si tu backend lo requiere
          headers,
          body: JSON.stringify(payload),
          signal,
        });
        const norm = normalizeResponse(res, {
          ownerScope: payload.ownerScope,
          ownerId: payload.ownerId ?? null,
        });
        setForm(norm);
        setOk("✅ Barra informativa guardada.");
        saved = true;
        break;
      } catch (e: any) {
        lastError = e?.message || String(e);
      }
    }

    if (!saved) {
      setErr(lastError || "No se pudo guardar la barra.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (canEdit) loadCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, token, isGlobalAdmin]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!canEdit) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
        <div className="mx-auto max-w-3xl section">
          <h1 className="text-xl md:text-2xl font-semibold mb-2">Barra informativa</h1>
          <p className="text-slate-600 mb-4">
            Tu rol <span className="chip">{myRole}</span> no puede gestionar la barra informativa.
          </p>
          <Link href="/dashboard/users/list" className="btn btn-ghost">Volver</Link>
        </div>
      </div>
    );
  }

  const audienceAll = form.audience === "ALL";
  const selectedRoles = audienceAll ? [] : (form.audience as Role[]);

  // Roles objetivo a mostrar en UI (puedes ajustar el orden o excluir SUPERUSER/ADMIN si quieres)
  const TARGETABLE_ROLES: Role[] = [
    "DISTRIBUTOR",
    "RESELLER",
    "TAQUILLA",
    "CLIENT",
    "ADMIN",
    "SUPERUSER",
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-app p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Barra informativa</h1>
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

        {/* Preview */}
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${VARIANT_STYLE[form.variant]}`}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5">📣</span>
            <div className="flex-1">
              <div className="font-medium mb-0.5">
                {form.variant === "info" && "Información"}
                {form.variant === "success" && "Éxito"}
                {form.variant === "warning" && "Aviso"}
                {form.variant === "error" && "Error"}
                {form.variant === "neutral" && "Mensaje"}
                {form.active ? "" : " (inactiva)"}
              </div>
              <div className="whitespace-pre-wrap">{form.message || "Tu mensaje aparecerá aquí…"}</div>
              {form.linkUrl ? (
                <div className="mt-1 underline">
                  <a href={form.linkUrl} target="_blank" rel="noreferrer">
                    {form.linkUrl}
                  </a>
                </div>
              ) : null}
              <div className="mt-2 text-xs opacity-70">
                Alcance: {form.ownerScope === "ALL" ? "Global" : "Mi árbol"} •{" "}
                {audienceAll ? "Todos los roles" : `Roles: ${selectedRoles.map(r => roleLabel[r]).join(", ") || "—"}`} •{" "}
                {form.includeDescendants ? "Incluye descendientes" : "Solo el rol seleccionado"}
              </div>
            </div>
            {form.dismissible && <span className="opacity-70">✖</span>}
          </div>
        </div>

        <form onSubmit={onSubmit} className="section">
          <h2 className="form-title">Configurar barra</h2>

          <fieldset className="form-grid" disabled={loading} aria-busy={loading}>
            <div className="md:col-span-2">
              <label className="text-sm mb-1 block text-slate-600">Mensaje</label>
              <textarea
                className="input min-h-[100px]"
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                placeholder="Escribe el mensaje que verán los usuarios…"
                required
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Tipo</label>
              <select
                className="input"
                value={form.variant}
                onChange={(e) => onChange("variant", e.target.value as Variant)}
              >
                <option value="info">Info</option>
                <option value="success">Éxito</option>
                <option value="warning">Aviso</option>
                <option value="error">Error</option>
                <option value="neutral">Neutro</option>
              </select>
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Link (opcional)</label>
              <input
                className="input"
                value={form.linkUrl}
                onChange={(e) => onChange("linkUrl", e.target.value)}
                placeholder="https://tu-dominio.com/detalles"
                inputMode="url"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.active}
                onChange={(e) => onChange("active", e.target.checked)}
              />
              <span>Activa</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.dismissible}
                onChange={(e) => onChange("dismissible", e.target.checked)}
              />
              <span>Permitir cerrar (dismissible)</span>
            </label>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Inicio (opcional)</label>
              <input
                type="datetime-local"
                className="input"
                value={form.startsAt || ""}
                onChange={(e) => onChange("startsAt", e.target.value || null)}
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-slate-600">Fin (opcional)</label>
              <input
                type="datetime-local"
                className="input"
                value={form.endsAt || ""}
                onChange={(e) => onChange("endsAt", e.target.value || null)}
              />
            </div>

            {/* Alcance y audiencia */}
            <div className="md:col-span-2">
              <label className="text-sm mb-1 block text-slate-600">Destinatarios</label>

              {/* Alcance por dueño */}
              <div className="mb-2 text-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-slate-500">Alcance:</span>
                    <span className="chip">
                      {isGlobalAdmin ? "Global (ADMIN/SUPERUSER)" : "Mi árbol (DISTRIBUTOR/RESELLER)"}
                    </span>
                  </div>
                  {/* Si quisieras permitir que ADMIN limite a su árbol, podrías agregar un selector aquí.
                      Por ahora lo fijamos automáticamente: ADMIN/SUPERUSER => ALL, otros => OWN_TREE */}
                </div>
              </div>

              {/* Audiencia por rol */}
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="audience"
                    className="h-4 w-4"
                    checked={audienceAll}
                    onChange={() => onChange("audience", "ALL")}
                  />
                  <span>Todos los roles</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="audience"
                    className="h-4 w-4"
                    checked={!audienceAll}
                    onChange={() =>
                      onChange("audience", selectedRoles.length ? selectedRoles : (["CLIENT"] as Role[]))
                    }
                  />
                  <span>Elegir roles específicos</span>
                </label>

                {!audienceAll && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                    {TARGETABLE_ROLES.map((r) => (
                      <label key={r} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedRoles.includes(r)}
                          onChange={(e) => {
                            let next = new Set(selectedRoles);
                            if (e.target.checked) next.add(r);
                            else next.delete(r);
                            const arr = Array.from(next) as Role[];
                            onChange("audience", arr.length ? (arr as Role[]) : (["CLIENT"] as Role[]));
                          }}
                        />
                        <span>{roleLabel[r]}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Propagación jerárquica */}
                <label className="inline-flex items-center gap-2 text-sm pl-0 md:pl-6">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.includeDescendants}
                    onChange={(e) => onChange("includeDescendants", e.target.checked)}
                  />
                  <span>Incluir descendientes de los roles seleccionados</span>
                </label>

                <p className="form-help">
                  • <b>ADMIN/SUPERUSER</b>: pueden notificar a roles principales en todo el sistema (y
                  sus descendientes). <br />
                  • <b>Distribuidor/Reseller</b>: el mensaje se limita a <b>su propio árbol</b> (sus
                  cuentas y dependientes), respetando los roles elegidos.
                </p>
              </div>
            </div>
          </fieldset>

          <div className="mt-6 flex gap-3">
            <button disabled={loading} className="btn btn-primary">
              {loading ? "Guardando…" : "Guardar"}
            </button>
            <Link href="/dashboard/users/list" className="btn btn-ghost">
              Cancelar
            </Link>
            <button
              type="button"
              className="btn"
              onClick={() =>
                setForm(
                  normalizeResponse({}, {
                    ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
                    ownerId: myId ?? null,
                    audience: "ALL",
                    includeDescendants: true,
                  })
                )
              }
            >
              Limpiar
            </button>
          </div>

          <p className="form-help mt-4">
            El backend debe considerar los campos <code>audience</code>,{" "}
            <code>includeDescendants</code>, <code>ownerScope</code> y <code>ownerId</code> para
            resolver la audiencia. Endpoints usados (ajustables):{" "}
            <code>/users/announcement-bar</code>, <code>/announcement-bar</code>,{" "}
            <code>/admin/announcement</code>, <code>/settings/announcement</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
