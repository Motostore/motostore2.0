"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MegaphoneIcon,
  CalendarDaysIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BellAlertIcon,
  FireIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

/* ================= Lógica de Negocio ================= */
import {
  Role,
  normalizeRole,
  roleLabel,
  atLeastRole,
} from "@/app/lib/roles";

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" ? t : null;
}

function apiBase(): string {
  try {
    const raw = (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_BASE_URL || "") + "";
    return raw.replace(/\/+$/, "");
  } catch { return ""; }
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
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
type OwnerScope = "ALL" | "OWN_TREE";

type Announcement = {
  id?: string | number | null;
  message: string;
  variant: Variant;
  active: boolean;
  dismissible: boolean;
  linkUrl: string;
  audience: Role[] | "ALL";
  includeDescendants: boolean;
  ownerScope: OwnerScope;
  ownerId?: string | number | null;
  startsAt?: string | null;
  endsAt?: string | null;
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

const VARIANT_PREVIEW: Record<Variant, string> = {
  info: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20 border-l-4 border-blue-800",
  success: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-500/20 border-l-4 border-emerald-800",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-l-4 border-orange-700",
  error: "bg-gradient-to-r from-[#E33127] to-red-600 text-white shadow-xl shadow-red-500/20 border-l-4 border-red-900",
  neutral: "bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-xl shadow-slate-500/20 border-l-4 border-black",
};

const VARIANT_CARDS: Record<Variant, { title: string, desc: string, icon: any, colorClass: string }> = {
    info: { title: "Informativo", desc: "Tips y avisos.", icon: InformationCircleIcon, colorClass: "text-blue-600 bg-blue-50 border-blue-200 ring-blue-500" },
    success: { title: "Éxito", desc: "Logros y novedades.", icon: CheckCircleIcon, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500" },
    warning: { title: "Alerta", desc: "Mantenimiento.", icon: BellAlertIcon, colorClass: "text-amber-600 bg-amber-50 border-amber-200 ring-amber-500" },
    error: { title: "Crítico", desc: "Urgencias.", icon: FireIcon, colorClass: "text-[#E33127] bg-red-50 border-red-200 ring-[#E33127]" },
    neutral: { title: "Neutro", desc: "General.", icon: MegaphoneIcon, colorClass: "text-slate-600 bg-slate-50 border-slate-200 ring-slate-500" },
};

const GET_ENDPOINTS = ["/users/announcement-bar", "/announcement-bar", "/admin/announcement", "/settings/announcement"];
const SAVE_ENDPOINTS = ["/users/announcement-bar", "/announcement-bar", "/admin/announcement", "/settings/announcement"];

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

function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function normalizeResponse(x: any, fallback: Partial<Announcement> = {}): Announcement {
  if (!x || typeof x !== "object") return { ...DEFAULT, ...fallback };
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
    includeDescendants: Boolean(x.includeDescendants ?? x.hierarchical ?? x.propagate ?? fallback.includeDescendants ?? true),
    ownerScope: (x.ownerScope ?? x.scopeOwner ?? fallback.ownerScope ?? "ALL") as OwnerScope,
    ownerId: x.ownerId ?? x.owner ?? x.createdBy ?? fallback.ownerId ?? null,
    startsAt: toLocalInput(x.startsAt ?? x.startAt ?? x.start ?? x.from ?? fallback.startsAt ?? null),
    endsAt: toLocalInput(x.endsAt ?? x.endAt ?? x.end ?? x.until ?? fallback.endsAt ?? null),
  };
}

export default function UsersAnnouncementBarPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const base = useMemo(() => apiBase(), []);
  const me: any = session?.user;

  const myRole = useMemo(() => normalizeRole(me?.role ?? me?.rol), [me]);
  const myId = useMemo(() => me?.id ?? me?.userId ?? me?.username ?? me?.email ?? null, [me]);

  const canEdit = atLeastRole(myRole, "ADMIN") || atLeastRole(myRole, "SUPERUSER"); 
  const isGlobalAdmin = atLeastRole(myRole, "SUPERUSER");

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
    setErr(null); setOk(null);
    const headers = token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : undefined;
    for (const ep of GET_ENDPOINTS) {
      try {
        const data = await api(`${base}${ep}`, { headers });
        const item = (Array.isArray(data) ? (data[0] ?? null) : data?.data ?? data) ?? null;
        if (item) {
          const norm = normalizeResponse(item, { ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE", ownerId: myId ?? null });
          setForm(norm);
          return;
        }
      } catch { }
    }
    setForm((f) => ({ ...f, ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE", ownerId: myId ?? null }));
  }

  function validate(): string | null {
    if (!canEdit) return "No autorizado.";
    if (!form.message.trim()) return "El mensaje es obligatorio.";
    if (form.startsAt && form.endsAt) {
      const a = new Date(form.startsAt);
      const b = new Date(form.endsAt);
      if (a.getTime() > b.getTime()) return "Fecha inicio > fin.";
    }
    if (form.audience !== "ALL" && (!Array.isArray(form.audience) || form.audience.length === 0)) {
      return "Selecciona audiencia.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const v = validate();
    if (v) { setErr(v); setOk(null); return; }

    setLoading(true); setErr(null); setOk(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
    };

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
        const res = await api(`${base}${ep}`, { method: "POST", headers, body: JSON.stringify(payload), signal });
        
        // Fix: Casteamos ownerScope para evitar error de tipos
        const norm = normalizeResponse(res, { 
            ownerScope: payload.ownerScope as any, 
            ownerId: payload.ownerId ?? null 
        });
        
        setForm(norm);
        setOk("Anuncio publicado exitosamente.");
        saved = true;
        break;
      } catch (e: any) { lastError = e?.message || String(e); }
    }
    if (!saved) setErr(lastError || "Error al guardar.");
    setLoading(false);
  }

  useEffect(() => { if (canEdit) loadCurrent(); }, [canEdit, token, isGlobalAdmin]);
  useEffect(() => { return () => abortRef.current?.abort(); }, []);

  if (!canEdit) return <div className="p-10 text-center text-slate-500">No tienes permisos para esta herramienta.</div>;

  const audienceAll = form.audience === "ALL";
  const selectedRoles = audienceAll ? [] : (form.audience as Role[]);
  
  // 💎 FIX: Casteamos el resultado del filtro a 'any' (o Role[]) para que TS no se queje
  // Error anterior: Type 'string[]' is not assignable to type 'Role[]'
  const TARGETABLE_ROLES: Role[] = (["SUPERUSER", "ADMIN", "DISTRIBUTOR", "RESELLER", "TAQUILLA", "CLIENT"] as any).filter(
    (r: any, i: any) => {
        if (!isGlobalAdmin && (r === "ADMIN" || r === "SUPERUSER")) return false;
        if (i > 0 && (r === "ADMIN" || r === "SUPERUSER")) return false;
        return true;
    }
  );


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>
      
      {/* HEADER HERO */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#E33127] to-red-700 rounded-2xl shadow-lg shadow-red-500/30 text-white">
                    <MegaphoneIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        Gestor de <span className="text-[#E33127]">Comunicados</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-500"/>
                        {isGlobalAdmin ? "Modo Administración Global (SUPERUSER)" : "Modo Distribuidor"}
                    </p>
                </div>
            </div>
            <Link href="/dashboard" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-sm shadow-sm hover:shadow-md">
                Volver al Panel
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: EDITOR (7 cols) */}
        <div className="xl:col-span-7 space-y-8">
            
            {/* ALERTAS */}
            {err && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
                    <ExclamationTriangleIcon className="w-6 h-6 shrink-0" /> {err}
                </div>
            )}
            {ok && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircleIcon className="w-6 h-6 shrink-0" /> {ok}
                </div>
            )}

            <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    
                    {/* SECCIÓN 1: CONTENIDO */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">PASO 1</span> Contenido del Mensaje
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <textarea
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-[#E33127]/10 focus:border-[#E33127] transition-all min-h-[140px] resize-none shadow-inner placeholder:text-slate-400"
                                    value={form.message}
                                    onChange={(e) => onChange("message", e.target.value)}
                                    placeholder="Escribe un mensaje impactante para tus usuarios..."
                                    required
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                                </div>
                                <input
                                    type="url"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] font-medium transition-all text-sm"
                                    value={form.linkUrl}
                                    onChange={(e) => onChange("linkUrl", e.target.value)}
                                    placeholder="https://enlace-opcional.com (Botón de acción)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 w-full"></div>

                    {/* SECCIÓN 2: ESTILO */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">PASO 2</span> Estilo Visual
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(["info", "success", "warning", "error", "neutral"] as Variant[]).map((v) => {
                                const style = VARIANT_CARDS[v];
                                const Icon = style.icon;
                                const isSelected = form.variant === v;
                                return (
                                    <button
                                        type="button"
                                        key={v}
                                        onClick={() => onChange("variant", v)}
                                        className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-md text-left
                                            ${isSelected 
                                                ? `${style.colorClass} ring-2 ring-offset-2 ring-offset-white font-bold bg-white shadow-lg` 
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <Icon className={`w-6 h-6 ${isSelected ? '' : 'opacity-50'}`} />
                                            {isSelected && <CheckCircleIcon className="w-5 h-5 opacity-100" />}
                                        </div>
                                        <div>
                                            <span className="block text-sm">{style.title}</span>
                                            <span className="block text-[10px] opacity-70 font-medium">{style.desc}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 w-full"></div>

                    {/* SECCIÓN 3: CONFIGURACIÓN AVANZADA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Programación Automática</h3>
                            <div className="space-y-3">
                                <div className="relative group">
                                    <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#E33127]" />
                                    <input
                                        type="datetime-local"
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-[#E33127] focus:ring-2 focus:ring-[#E33127]/10 transition-all"
                                        value={form.startsAt || ""}
                                        onChange={(e) => onChange("startsAt", e.target.value || null)}
                                    />
                                    <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Inicio</label>
                                </div>
                                <div className="relative group">
                                    <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#E33127]" />
                                    <input
                                        type="datetime-local"
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-[#E33127] focus:ring-2 focus:ring-[#E33127]/10 transition-all"
                                        value={form.endsAt || ""}
                                        onChange={(e) => onChange("endsAt", e.target.value || null)}
                                    />
                                    <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Fin</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Audiencia Objetivo</h3>
                            <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => onChange("audience", "ALL")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${audienceAll ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                                <button type="button" onClick={() => onChange("audience", (["CLIENT"] as Role[]))} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${!audienceAll ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Filtrar</button>
                            </div>
                            
                            {!audienceAll && (
                                <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                                    {TARGETABLE_ROLES.map((r) => (
                                        <label key={r} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded text-[#E33127] focus:ring-[#E33127]"
                                                checked={selectedRoles.includes(r)}
                                                onChange={(e) => {
                                                    let next = new Set(selectedRoles);
                                                    if (e.target.checked) next.add(r); else next.delete(r);
                                                    const arr = Array.from(next) as Role[];
                                                    onChange("audience", arr.length ? arr : (["CLIENT"] as Role[]));
                                                }}
                                            />
                                            {roleLabel[r]}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {isGlobalAdmin && (
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Opciones de Ámbito</h3>
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="rounded text-purple-600 focus:ring-purple-600"
                                        checked={form.ownerScope === "ALL"}
                                        onChange={() => onChange("ownerScope", form.ownerScope === "ALL" ? "OWN_TREE" : "ALL")}
                                    />
                                    Ámbito Global
                                </label>
                                <p className="text-xs text-slate-500 w-1/2">
                                    Si está activo, el anuncio será visible para todos los usuarios de la plataforma, ignorando la jerarquía.
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-600"
                                        checked={form.includeDescendants}
                                        onChange={() => onChange("includeDescendants", !form.includeDescendants)}
                                    />
                                    Incluir Descendientes
                                </label>
                                <p className="text-xs text-slate-500 w-1/2">
                                    Si está activo, los revendedores debajo de ti también verán este anuncio (solo aplica si el ámbito no es Global).
                                </p>
                            </div>
                        </div>
                    )}


                </div>

                {/* FOOTER ACCIONES */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setForm(normalizeResponse({}, { ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE", ownerId: myId ?? null }))}
                        className="text-slate-400 font-bold text-xs hover:text-[#E33127] transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Limpiar formulario
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 rounded-xl bg-[#E33127] text-white font-black text-sm tracking-wide shadow-xl shadow-red-500/20 hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 uppercase"
                    >
                        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <MegaphoneIcon className="w-5 h-5"/>}
                        {loading ? "Publicando..." : "Publicar Anuncio"}
                    </button>
                </div>
            </form>
        </div>

        {/* COLUMNA DERECHA: PREVIEW (5 cols) */}
        <div className="xl:col-span-5 space-y-8 sticky top-24">
            
            {/* SIMULADOR DE TELÉFONO */}
            <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[6px] border-slate-800 relative mx-auto max-w-sm">
                
                {/* Notch & Botones */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20 flex justify-center items-center">
                    <div className="w-16 h-2 bg-slate-900 rounded-full opacity-50"></div>
                </div>
                <div className="absolute -right-[8px] top-24 w-[6px] h-12 bg-slate-700 rounded-r-md"></div>
                <div className="absolute -left-[8px] top-24 w-[6px] h-8 bg-slate-700 rounded-l-md"></div>
                <div className="absolute -left-[8px] top-36 w-[6px] h-12 bg-slate-700 rounded-l-md"></div>

                <div className="bg-white rounded-[2.2rem] overflow-hidden h-[550px] relative flex flex-col">
                    
                    {/* Header App Simulado */}
                    <div className="bg-slate-50 border-b border-slate-100 p-5 pt-12 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                        <div className="w-24 h-4 bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                    </div>

                    {/* Contenido Simulado */}
                    <div className="flex-1 bg-slate-50 p-4 space-y-4 overflow-hidden relative">
                        
                        {/* EL ANUNCIO EN VIVO */}
                        <div className="transition-all duration-500 ease-in-out transform">
                            {form.active ? (
                                <div className={`rounded-xl p-5 relative overflow-hidden shadow-lg ${VARIANT_PREVIEW[form.variant]}`}>
                                    <div className="flex items-start gap-3 relative z-10">
                                        <InformationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 opacity-90" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm leading-snug drop-shadow-sm whitespace-pre-wrap break-words">
                                                {form.message || "Tu mensaje aquí..."}
                                            </p>
                                            
                                            {form.linkUrl && (
                                                <div className="mt-3">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold backdrop-blur-md border border-white/10">
                                                        <LinkIcon className="w-3 h-3" />
                                                        Ver Detalles
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {form.dismissible && (
                                            <XMarkIcon className="w-4 h-4 opacity-70" />
                                        )}
                                    </div>
                                    {/* Decoración de fondo del anuncio */}
                                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-100 opacity-50">
                                    <EyeSlashIcon className="w-6 h-6" />
                                    <span className="font-bold text-xs">Anuncio Oculto</span>
                                </div>
                            )}
                        </div>

                        {/* Elementos dummy de fondo (App Content) */}
                        <div className="space-y-4 opacity-20 pointer-events-none filter blur-[1px]">
                            <div className="h-32 bg-slate-300 rounded-2xl w-full"></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-24 bg-slate-300 rounded-2xl"></div>
                                <div className="h-24 bg-slate-300 rounded-2xl"></div>
                            </div>
                            <div className="h-16 bg-slate-300 rounded-2xl w-full"></div>
                            <div className="h-16 bg-slate-300 rounded-2xl w-full"></div>
                        </div>

                    </div>

                    {/* Barra de navegación simulada */}
                    <div className="bg-white border-t border-slate-100 p-4 pb-6 flex justify-around">
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        <div className="w-6 h-6 bg-[#E33127] rounded-full shadow-lg shadow-red-500/50 transform scale-110"></div>
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* CONTROLES RÁPIDOS */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Control de Visibilidad</h3>
                
                <div 
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group ${form.active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`} 
                    onClick={() => onChange('active', !form.active)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${form.active ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {form.active ? <EyeIcon className="w-5 h-5"/> : <EyeSlashIcon className="w-5 h-5"/>}
                        </div>
                        <div>
                            <span className={`block font-black text-sm ${form.active ? 'text-emerald-800' : 'text-slate-600'}`}>
                                {form.active ? 'Visible en la App' : 'Oculto para todos'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Estado global del anuncio</span>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${form.active ? 'translate-x-5' : ''}`}></div>
                    </div>
                </div>

                <div 
                    className="p-4 rounded-2xl border-2 border-slate-100 bg-white cursor-pointer hover:border-blue-200 transition-all flex items-center justify-between group" 
                    onClick={() => onChange('dismissible', !form.dismissible)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${form.dismissible ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <XMarkIcon className="w-5 h-5"/>
                        </div>
                        <div>
                            <span className="block font-black text-sm text-slate-700">Permitir Cerrar</span>
                            <span className="text-[10px] text-slate-500 font-medium">El usuario puede quitar el aviso</span>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${form.dismissible ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${form.dismissible ? 'translate-x-5' : ''}`}></div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}