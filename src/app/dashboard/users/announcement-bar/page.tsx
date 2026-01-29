'use client';

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MegaphoneIcon,
  LinkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  FireIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
  RectangleStackIcon,
  LockClosedIcon,
  ArrowPathIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

/* ================= Lógica de Roles ================= */
import { Role, normalizeRole } from "@/app/lib/roles";

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

// --- PROXY ACTIVADO ---
function apiBase(): string {
  return "/api-proxy";
}

// Función API mejorada
async function api(path: string, init?: RequestInit) {
  try {
      const res = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        cache: "no-store",
      });

      if (!res.ok) {
         const txt = await res.text().catch(() => "");
         // Manejo silencioso de 404 para evitar pantalla roja si no hay anuncios aún
         if (res.status === 404) {
             throw new Error("404 Not Found"); 
         }
         throw new Error(`Error ${res.status}: ${txt}`);
      }
      return res.json();
  } catch (err: any) {
      if (err.message !== "404 Not Found") {
        console.error("🔥 Error API:", err);
      }
      throw err;
  }
}

// --- TIPOS ---
type Variant = "info" | "success" | "warning" | "error" | "neutral";
type LocationType = "INTERNAL" | "EXTERNAL";

type Announcement = {
  id?: number | null;
  message: string;
  variant: Variant;
  active: boolean;
  dismissible: boolean;
  linkUrl: string;
  audience: Role[] | "ALL";
  location: LocationType;
  ownerScope: "ALL" | "OWN_TREE"; 
  includeDescendants: boolean;
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
  location: "INTERNAL",
  ownerScope: "ALL",
  includeDescendants: true,
  startsAt: null,
  endsAt: null,
};

// Tarjetas de estilo visual
const VARIANT_CARDS: Record<Variant, { title: string, icon: any, colorClass: string }> = {
    info: { title: "Informativo", icon: InformationCircleIcon, colorClass: "text-blue-600 bg-blue-50 border-blue-200 ring-blue-500" },
    success: { title: "Éxito", icon: CheckCircleIcon, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500" },
    warning: { title: "Alerta", icon: BellAlertIcon, colorClass: "text-amber-600 bg-amber-50 border-amber-200 ring-amber-500" },
    error: { title: "Urgente", icon: FireIcon, colorClass: "text-[#E33127] bg-red-50 border-red-200 ring-[#E33127]" },
    neutral: { title: "Neutro", icon: MegaphoneIcon, colorClass: "text-slate-600 bg-slate-50 border-slate-200 ring-slate-500" },
};

const VARIANT_PREVIEW: Record<Variant, string> = {
  info: "bg-blue-600 text-white border-l-4 border-blue-800",
  success: "bg-emerald-600 text-white border-l-4 border-emerald-800",
  warning: "bg-amber-500 text-white border-l-4 border-amber-700",
  error: "bg-[#E33127] text-white border-l-4 border-red-900",
  neutral: "bg-slate-800 text-white border-l-4 border-black",
};

// --- CORRECCIÓN FINAL: Rutas exactas encontradas en tu Backend Python ---
const ENDPOINTS = [
    "/announcements/announcement-bar",       // Ruta principal (announcements.py)
    "/dashboard/announcements"               // Ruta alternativa (dashboard.py)
];

export default function UsersAnnouncementBarPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);
  const base = useMemo(() => apiBase(), []);
  
  const me: any = session?.user;
  const myRole = useMemo(() => normalizeRole(me?.role), [me]);
  
  const isGlobalAdmin = ['SUPERUSER', 'ADMIN'].includes(myRole);
  
  const [currentTab, setCurrentTab] = useState<LocationType>("INTERNAL");
  const [form, setForm] = useState<Announcement>({ ...DEFAULT });
  const [loading, setLoading] = useState(false);
  
  function onChange<K extends keyof Announcement>(k: K, v: Announcement[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function loadCurrent() {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    
    setForm(prev => ({ ...DEFAULT, location: currentTab })); 

    for (const ep of ENDPOINTS) {
      try {
        const data = await api(`${base}${ep}?location=${currentTab}`, { headers });
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
            location: currentTab,
            ownerScope: item.ownerScope || "ALL",
            includeDescendants: item.includeDescendants ?? true,
            startsAt: item.startsAt || null,
            endsAt: item.endsAt || null,
          });
          return; // Éxito, salimos del bucle
        }
      } catch (e: any) { 
        // Si es 404, simplemente pasamos al siguiente endpoint o terminamos sin error visual
        if (e.message === "404 Not Found") continue;
        console.warn(`Intento fallido en ${ep}:`, e);
      }
    }
  }

  useEffect(() => { 
      if (token) loadCurrent(); 
  }, [token, currentTab]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!form.message.trim()) return toast.error("El mensaje es obligatorio.");
    
    if (currentTab === 'EXTERNAL' && !isGlobalAdmin) {
        return toast.error("No tienes permisos para modificar la barra externa.");
    }

    setLoading(true);
    const toastId = toast.loading("Guardando cambios...");

    try {
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        
        const payload = {
            id: form.id,
            message: form.message,
            variant: form.variant,
            active: form.active,
            dismissible: form.dismissible,
            linkUrl: form.linkUrl || null,
            audience: form.audience,
            location: currentTab, 
            ownerScope: "ALL",
            includeDescendants: form.includeDescendants,
            startsAt: form.startsAt,
            endsAt: form.endsAt
        };

        let saved = false;
        let lastError = null;

        for (const ep of ENDPOINTS) {
            try {
                await api(`${base}${ep}`, { method: "POST", headers, body: JSON.stringify(payload) });
                saved = true;
                break;
            } catch (err: any) { 
                console.error(`Fallo intento en ${ep}:`, err);
                lastError = err;
            }
        }

        if (saved) {
             toast.dismiss(toastId);
             toast.success(`Barra ${currentTab === 'INTERNAL' ? 'Interna' : 'Externa'} actualizada!`);
             loadCurrent();
        } else {
             throw lastError || new Error("No se pudo conectar con el servidor.");
        }

    } catch (e: any) {
        toast.error(`${e.message}`, { id: toastId });
    } finally {
        setLoading(false);
    }
  }

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
                        Gestor de Anuncios
                    </h1>
                    <p className="text-slate-500 font-medium text-xs mt-1">
                        Configuración de mensajes del sistema
                    </p>
                </div>
            </div>
            
            {/* TABS DE SELECCIÓN */}
            {isGlobalAdmin ? (
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setCurrentTab("INTERNAL")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${currentTab === "INTERNAL" ? "bg-white text-[#E33127] shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                        <RectangleStackIcon className="w-4 h-4" /> Interna
                    </button>
                    <button onClick={() => setCurrentTab("EXTERNAL")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${currentTab === "EXTERNAL" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                        <GlobeAltIcon className="w-4 h-4" /> Externa
                    </button>
                </div>
            ) : (
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2">
                    <LockClosedIcon className="w-3 h-3"/> Solo Cadena de Mando
                </div>
            )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* EDITOR */}
        <div className="xl:col-span-7 space-y-6">
            <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                
                {/* Indicador de color según la pestaña */}
                <div className={`h-1.5 w-full ${currentTab === 'INTERNAL' ? 'bg-[#E33127]' : 'bg-blue-600'}`}></div>

                <div className="p-6 md:p-8 space-y-8">
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
                        <InformationCircleIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            {currentTab === 'EXTERNAL' ? (
                                <span className="font-bold text-blue-600">BARRA PÚBLICA (LOGIN):</span> 
                            ) : (
                                <span className="font-bold text-[#E33127]">BARRA INTERNA (DASHBOARD):</span>
                            )}
                            {currentTab === 'EXTERNAL' 
                                ? " Visible para cualquiera que entre a la página de inicio."
                                : " Visible solo para usuarios que han iniciado sesión."
                            }
                        </div>
                    </div>

                    {/* 1. MENSAJE */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mensaje & Enlace</h3>
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] min-h-[100px] resize-none placeholder:text-slate-400"
                                value={form.message}
                                onChange={(e) => onChange("message", e.target.value)}
                                placeholder="Escribe el anuncio aquí..."
                                required
                            />
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="url"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#E33127] focus:outline-none"
                                    value={form.linkUrl || ""}
                                    onChange={(e) => onChange("linkUrl", e.target.value)}
                                    placeholder="https://... (Link opcional)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-50"></div>

                    {/* 2. ESTILO */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Estilo Visual</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(Object.keys(VARIANT_CARDS) as Variant[]).map((v) => {
                                const style = VARIANT_CARDS[v];
                                const Icon = style.icon;
                                const isSel = form.variant === v;
                                return (
                                    <button type="button" key={v} onClick={() => onChange("variant", v)} className={`p-3 rounded-xl border text-left transition-all ${isSel ? style.colorClass : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <Icon className={`w-5 h-5 ${isSel ? '' : 'text-slate-400'}`} />
                                            {isSel && <CheckCircleIcon className="w-4 h-4 opacity-100" />}
                                        </div>
                                        <span className={`block text-xs font-bold ${isSel ? '' : 'text-slate-600'}`}>{style.title}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-end">
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

        {/* PREVIEW */}
        <div className="xl:col-span-5 space-y-6 sticky top-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 relative mx-auto max-w-xs">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-20"></div>
                <div className="bg-white rounded-[2rem] overflow-hidden h-[500px] relative flex flex-col pt-8">
                     <div className="bg-slate-50 p-4 space-y-4">
                        <div className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest mb-2">
                             Vista Previa ({currentTab === 'INTERNAL' ? 'Interna' : 'Externa'})
                        </div>
                        {form.active ? (
                            <div className={`rounded-xl p-4 shadow-md transition-all ${VARIANT_PREVIEW[form.variant]}`}>
                                <p className="font-bold text-xs leading-snug">{form.message || "Tu mensaje aparecerá aquí..."}</p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-xs font-bold bg-slate-100">
                                <EyeSlashIcon className="w-5 h-5 mx-auto mb-1"/>
                                Anuncio Oculto
                            </div>
                        )}
                     </div>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3 shadow-sm">
                <div 
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${form.active ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} 
                    onClick={() => onChange('active', !form.active)}
                >
                    <span className={`text-xs font-bold ${form.active ? 'text-emerald-900' : 'text-slate-600'}`}>Visible en App</span>
                    <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${form.active ? 'translate-x-3' : ''}`}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}