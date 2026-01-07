'use client';

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
  DevicePhoneMobileIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

/* ================= Lógica de Negocio ================= */
import {
  Role,
  normalizeRole,
  roleLabel,
} from "@/app/lib/roles";

// --- HELPERS ---

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

function apiBase(): string {
  // Ajuste para asegurar que usa la URL de producción si no hay env
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "https://motostore-api.onrender.com/api/v1").replace(/\/+$/, "");
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

// Jerarquía de roles para validación de permisos
const ROLE_HIERARCHY: Role[] = ['CLIENT', 'RESELLER', 'DISTRIBUTOR', 'ADMIN', 'SUPERUSER'];

function checkPermission(currentRole: Role, requiredRole: Role): boolean {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return currentIndex >= requiredIndex;
}

// --- TIPOS ---

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

// Estilos de previsualización (Tailwind)
const VARIANT_PREVIEW: Record<Variant, string> = {
  info: "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-l-4 border-blue-800",
  success: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-l-4 border-emerald-800",
  warning: "bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-l-4 border-amber-700",
  error: "bg-[#E33127] text-white shadow-lg shadow-red-500/30 border-l-4 border-red-900",
  neutral: "bg-slate-800 text-white shadow-lg shadow-slate-500/30 border-l-4 border-black",
};

// Tarjetas de selección de estilo
const VARIANT_CARDS: Record<Variant, { title: string, desc: string, icon: any, colorClass: string }> = {
    info: { title: "Informativo", desc: "Avisos generales.", icon: InformationCircleIcon, colorClass: "text-blue-600 bg-blue-50 border-blue-200 ring-blue-500" },
    success: { title: "Éxito", desc: "Logros y novedades.", icon: CheckCircleIcon, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500" },
    warning: { title: "Alerta", desc: "Mantenimiento.", icon: BellAlertIcon, colorClass: "text-amber-600 bg-amber-50 border-amber-200 ring-amber-500" },
    error: { title: "Urgente", desc: "Crítico / Importante.", icon: FireIcon, colorClass: "text-[#E33127] bg-red-50 border-red-200 ring-[#E33127]" },
    neutral: { title: "Neutro", desc: "Noticias simples.", icon: MegaphoneIcon, colorClass: "text-slate-600 bg-slate-50 border-slate-200 ring-slate-500" },
};

const ENDPOINTS = ["/users/announcement-bar", "/announcement-bar", "/admin/announcement"];

// Helpers de fecha
function toLocalInput(dt?: string | number | Date | null): string {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function UsersAnnouncementBarPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const base = useMemo(() => apiBase(), []);
  
  const me: any = session?.user;
  const myRole = useMemo(() => normalizeRole(me?.role), [me]);
  const myId = useMemo(() => me?.id, [me]);

  // Permisos: Solo Admin y Superuser pueden editar anuncios globales
  const canEdit = checkPermission(myRole, "ADMIN"); 
  const isGlobalAdmin = checkPermission(myRole, "SUPERUSER");

  const [form, setForm] = useState<Announcement>({ ...DEFAULT });
  const [loading, setLoading] = useState(false);
  
  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof Announcement>(k: K, v: Announcement[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Cargar anuncio existente
  async function loadCurrent() {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Intentamos cargar de varios endpoints posibles
    for (const ep of ENDPOINTS) {
      try {
        const data = await api(`${base}${ep}`, { headers });
        const item = Array.isArray(data) ? data[0] : (data?.data || data);
        
        if (item) {
          setForm({
            id: item.id ?? null,
            message: item.message || "",
            variant: (item.variant as Variant) || "info",
            active: item.active ?? true,
            dismissible: item.dismissible ?? true,
            linkUrl: item.linkUrl || "",
            audience: item.audience || "ALL",
            includeDescendants: item.includeDescendants ?? true,
            ownerScope: item.ownerScope || (isGlobalAdmin ? "ALL" : "OWN_TREE"),
            startsAt: toLocalInput(item.startsAt),
            endsAt: toLocalInput(item.endsAt),
          });
          return;
        }
      } catch { /* Continue to next endpoint */ }
    }
  }

  useEffect(() => { 
      if (canEdit && token) loadCurrent(); 
  }, [canEdit, token, isGlobalAdmin, base]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!form.message.trim()) return toast.error("El mensaje es obligatorio.");
    if (form.startsAt && form.endsAt && new Date(form.startsAt) > new Date(form.endsAt)) {
        return toast.error("La fecha de inicio debe ser anterior al fin.");
    }

    setLoading(true);
    const toastId = toast.loading("Publicando anuncio...");

    try {
        const headers = { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        const payload = {
            ...form,
            startsAt: fromLocalInput(form.startsAt || ""),
            endsAt: fromLocalInput(form.endsAt || ""),
            // Forzamos el scope según el rol para seguridad
            ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE",
            ownerId: isGlobalAdmin ? null : myId
        };

        // Guardamos en el primer endpoint que responda
        let saved = false;
        for (const ep of ENDPOINTS) {
            try {
                await api(`${base}${ep}`, { method: "POST", headers, body: JSON.stringify(payload) });
                saved = true;
                break;
            } catch { /* Try next */ }
        }

        if (saved) {
            toast.success("¡Anuncio publicado correctamente!", { id: toastId });
        } else {
            throw new Error("No se pudo conectar con el servidor de anuncios.");
        }

    } catch (e: any) {
        toast.error(e.message || "Error al guardar", { id: toastId });
    } finally {
        setLoading(false);
    }
  }

  if (!canEdit) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                <ShieldCheckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
                <h2 className="text-xl font-black text-slate-800">Acceso Restringido</h2>
                <p className="text-slate-500 mt-2 text-sm">Esta herramienta es exclusiva para Administradores.</p>
                <Link href="/dashboard" className="mt-6 inline-block text-[#E33127] font-bold text-sm hover:underline">Volver al inicio</Link>
            </div>
        </div>
      );
  }

  const audienceAll = form.audience === "ALL";
  const selectedRoles = audienceAll ? [] : (form.audience as Role[]);
  const targetRoles: Role[] = ["CLIENT", "RESELLER", "DISTRIBUTOR", "ADMIN"];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 animate-fadeIn">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                    <SpeakerWaveIcon className="w-6 h-6 text-[#E33127]" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        Barra de Anuncios
                    </h1>
                    <p className="text-slate-500 font-medium text-xs mt-1">
                        Configura mensajes globales para la aplicación
                    </p>
                </div>
            </div>
            <Link href="/dashboard" className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-[#E33127] transition-all text-xs shadow-sm">
                Volver al Dashboard
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* EDITOR (Izquierda) */}
        <div className="xl:col-span-7 space-y-6">
            <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* 1. CONTENIDO */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">PASO 1</span> Mensaje & Enlace
                        </h3>
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all min-h-[100px] resize-none placeholder:text-slate-400"
                                value={form.message}
                                onChange={(e) => onChange("message", e.target.value)}
                                placeholder="Escribe aquí el anuncio importante..."
                                required
                            />
                            
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#E33127]" />
                                <input
                                    type="url"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] text-sm transition-all"
                                    value={form.linkUrl}
                                    onChange={(e) => onChange("linkUrl", e.target.value)}
                                    placeholder="https://... (URL opcional del botón)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-50"></div>

                    {/* 2. ESTILO */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">PASO 2</span> Tipo de Aviso
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(Object.keys(VARIANT_CARDS) as Variant[]).map((v) => {
                                const style = VARIANT_CARDS[v];
                                const Icon = style.icon;
                                const isSelected = form.variant === v;
                                return (
                                    <button
                                        type="button"
                                        key={v}
                                        onClick={() => onChange("variant", v)}
                                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${isSelected ? style.colorClass : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-slate-400'}`} />
                                            {isSelected && <CheckCircleIcon className="w-4 h-4 opacity-100" />}
                                        </div>
                                        <span className={`block text-xs font-bold ${isSelected ? '' : 'text-slate-600'}`}>{style.title}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="border-t border-slate-50"></div>

                    {/* 3. CONFIGURACIÓN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Programación</h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <span className="absolute top-1 left-3 text-[9px] font-bold text-slate-400 uppercase">Inicio</span>
                                    <input
                                        type="datetime-local"
                                        className="w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-[#E33127] focus:outline-none"
                                        value={form.startsAt || ""}
                                        onChange={(e) => onChange("startsAt", e.target.value || null)}
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1 left-3 text-[9px] font-bold text-slate-400 uppercase">Fin</span>
                                    <input
                                        type="datetime-local"
                                        className="w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-[#E33127] focus:outline-none"
                                        value={form.endsAt || ""}
                                        onChange={(e) => onChange("endsAt", e.target.value || null)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audiencia</h3>
                            <div className="flex gap-2 mb-2 bg-slate-100 p-1 rounded-lg">
                                <button type="button" onClick={() => onChange("audience", "ALL")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${audienceAll ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Todos</button>
                                <button type="button" onClick={() => onChange("audience", ["CLIENT"])} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${!audienceAll ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Filtrar</button>
                            </div>
                            
                            {!audienceAll && (
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    {targetRoles.map((r) => (
                                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded text-[#E33127] focus:ring-[#E33127]"
                                                checked={selectedRoles.includes(r)}
                                                onChange={(e) => {
                                                    const newRoles = new Set(selectedRoles);
                                                    if(e.target.checked) newRoles.add(r); else newRoles.delete(r);
                                                    onChange("audience", Array.from(newRoles));
                                                }}
                                            />
                                            <span className="text-[10px] font-bold text-slate-600">{roleLabel[r]}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => setForm({ ...DEFAULT, ownerScope: isGlobalAdmin ? "ALL" : "OWN_TREE" })}
                        className="text-xs font-bold text-slate-400 hover:text-[#E33127] transition-colors"
                    >
                        Restablecer
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-[#E33127] text-white font-black text-xs uppercase tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <MegaphoneIcon className="w-4 h-4"/>}
                        {loading ? "Guardando..." : "Publicar Anuncio"}
                    </button>
                </div>
            </form>
        </div>

        {/* COLUMNA DERECHA: PREVIEW (5 cols) */}
        <div className="xl:col-span-5 space-y-6 sticky top-24">
            
            {/* TELÉFONO */}
            <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 relative mx-auto max-w-xs">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-20"></div>

                <div className="bg-white rounded-[2rem] overflow-hidden h-[500px] relative flex flex-col">
                    
                    {/* Header App */}
                    <div className="bg-slate-50 border-b border-slate-100 p-4 pt-8 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="w-20 h-3 bg-slate-200 rounded-full"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 bg-slate-50 p-4 space-y-4 relative">
                        
                        {/* ANUNCIO PREVIEW */}
                        {form.active ? (
                            <div className={`rounded-xl p-4 relative overflow-hidden shadow-md transform transition-all duration-300 ${VARIANT_PREVIEW[form.variant]}`}>
                                <div className="flex items-start gap-3 relative z-10">
                                    <InformationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 opacity-90" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs leading-snug whitespace-pre-wrap">
                                            {form.message || "Tu mensaje aparecerá aquí..."}
                                        </p>
                                        
                                        {form.linkUrl && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-[9px] font-black backdrop-blur-sm">
                                                    VER MÁS <LinkIcon className="w-2.5 h-2.5" />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {form.dismissible && <XMarkIcon className="w-4 h-4 opacity-70" />}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100">
                                <EyeSlashIcon className="w-5 h-5" />
                                <span className="font-bold text-[10px]">OCULTO EN LA APP</span>
                            </div>
                        )}

                        {/* Dummy Content */}
                        <div className="space-y-3 opacity-20 pointer-events-none">
                            <div className="h-24 bg-slate-300 rounded-xl w-full"></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-20 bg-slate-300 rounded-xl"></div>
                                <div className="h-20 bg-slate-300 rounded-xl"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* CONTROLES RÁPIDOS */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opciones Rápidas</h3>
                
                <div 
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between group transition-all ${form.active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} 
                    onClick={() => onChange('active', !form.active)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${form.active ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {form.active ? <EyeIcon className="w-4 h-4"/> : <EyeSlashIcon className="w-4 h-4"/>}
                        </div>
                        <span className={`text-xs font-bold ${form.active ? 'text-emerald-900' : 'text-slate-600'}`}>Visible</span>
                    </div>
                    <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${form.active ? 'translate-x-3' : ''}`}></div>
                    </div>
                </div>

                <div 
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between group transition-all ${form.dismissible ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} 
                    onClick={() => onChange('dismissible', !form.dismissible)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${form.dismissible ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                            <XMarkIcon className="w-4 h-4"/>
                        </div>
                        <span className={`text-xs font-bold ${form.dismissible ? 'text-blue-900' : 'text-slate-600'}`}>Cerrable</span>
                    </div>
                    <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${form.dismissible ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${form.dismissible ? 'translate-x-3' : ''}`}></div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}