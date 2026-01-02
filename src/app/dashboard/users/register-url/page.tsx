"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import {
  LinkIcon,
  UserIcon,
  ClockIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  UsersIcon
} from "@heroicons/react/24/outline";

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

function publicBase(): string {
  try {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL || "") + "";
    if (raw) return raw.replace(/\/+$/, "");
    if (typeof window !== "undefined") return window.location.origin;
  } catch {}
  return "http://localhost:3000";
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

/* ================= Types ================= */

type InviteResponse = | { 
    url?: string; 
    inviteUrl?: string; 
    token?: string; 
    expiresAt?: string | number;
    referralCode?: string; 
    usageCount?: number;   
} | null;

type FormState = {
  role: Role;
  owner: string;
  expiresHours: number;
  singleUse: boolean;
};

/* ================= Page ================= */

export default function UsersRegisterUrlPage() {
  const { data: session } = useSession();
  const token = useMemo(() => pickToken(session), [session]);

  const currentUser: any = session?.user;
  const currentRole = useMemo(() => normalizeRole(currentUser?.role ?? currentUser?.rol), [currentUser]);

  const roleOptions = useMemo(() => creatableRolesFor(currentRole, { includeSelf: false }), [currentRole]);

  const [form, setForm] = useState<FormState>({
    role: roleOptions.includes("CLIENT") ? "CLIENT" : (roleOptions[0] ?? "CLIENT"),
    owner: String(currentUser?.id ?? currentUser?.userId ?? currentUser?.username ?? currentUser?.email ?? ""),
    expiresHours: 48,
    singleUse: true,
  });

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  
  // Datos generados por el sistema
  const [referralCode, setReferralCode] = useState<string>("");
  const [usageCount, setUsageCount] = useState<number>(0);

  const abortRef = useRef<AbortController | null>(null);

  function onChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): string | null {
    if (!roleOptions.length) return "No autorizado: tu rol no puede generar enlaces.";
    if (!form.owner.trim()) return "Falta el identificador del owner.";
    if (!Number.isFinite(form.expiresHours) || form.expiresHours <= 0) return "Horas inválidas.";
    return null;
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setResultUrl("");
    setReferralCode("");
    setUsageCount(0);

    const v = validate();
    if (v) return toast.error(v);

    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const base = apiBase();
    const site = publicBase();

    try {
      const expiresAt = Date.now() + form.expiresHours * 60 * 60 * 1000;
      const endpoints = ["/users/register-url", "/auth/register-url", "/invites", "/users/invite"];
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
              body: JSON.stringify({ role: form.role, owner: form.owner, singleUse: form.singleUse, expiresAt }),
              signal,
            });
            invite = res as InviteResponse;
            if (invite?.url || invite?.inviteUrl || invite?.token) break;
          } catch { }
        }
      }

      let finalUrl = "";
      // El sistema genera el código automáticamente basado en la respuesta o un random seguro
      let finalCode = ""; 

      if (invite?.url || invite?.inviteUrl) {
        finalUrl = String(invite?.url || invite?.inviteUrl);
        finalCode = invite.referralCode || invite.token?.slice(0, 8).toUpperCase() || "SYS-" + Math.floor(1000 + Math.random() * 9000);
        toast.success("Enlace generado por el servidor.");
      } else if (invite?.token) {
        finalUrl = `${site}/Registro?token=${encodeURIComponent(invite.token)}`;
        finalCode = invite.token.slice(0, 8).toUpperCase();
        toast.success("Enlace generado con token seguro.");
      } else {
        // Fallback local
        const qs = new URLSearchParams({ role: form.role, owner: form.owner, exp: String(expiresAt), once: String(form.singleUse ? 1 : 0) });
        finalUrl = `${site}/Registro?${qs.toString()}`;
        // Generación de código de sistema simulado
        finalCode = (form.owner.substring(0, 3) + Math.floor(Math.random() * 10000)).toUpperCase();
        toast.success("Enlace generado localmente.");
      }

      setResultUrl(finalUrl);
      setReferralCode(finalCode);
      setUsageCount(invite?.usageCount || 0);

    } catch (e: any) {
      toast.error(e?.message || "Error al generar enlace.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("¡Copiado!");
    } catch {
      toast.error("Error al copiar. Intenta manual.");
    }
  }

  useEffect(() => { return () => abortRef.current?.abort(); }, []);

  if (!roleOptions.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md text-center">
          <ShieldCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900">Acceso Restringido</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Tu rol <span className="font-bold text-[#E33127]">{currentRole}</span> no tiene permisos para generar invitaciones.
          </p>
          <Link href="/dashboard/users/list" className="mt-6 inline-block text-sm font-bold text-blue-600 hover:underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <LinkIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                {/* CAMBIO REALIZADO AQUÍ */}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Link de <span className="text-[#E33127]">Registro</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Crea accesos para nuevos usuarios Web y App.
                </p>
            </div>
        </div>
        <Link href="/dashboard/users/list" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:text-[#E33127] transition-all text-sm">
            <ArrowLeftIcon className="w-4 h-4" /> Volver
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* FORMULARIO */}
        <form onSubmit={onGenerate} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ROL */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rol a Asignar</label>
                    <div className="relative">
                        <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold focus:border-[#E33127] focus:ring-2 focus:ring-red-100 outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
                            value={form.role}
                            onChange={(e) => onChange("role", normalizeRole(e.target.value))}
                        >
                            {roleOptions.map((r) => (
                                <option key={r} value={r}>{roleLabel[r]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* OWNER */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asignar a (Owner)</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-2 focus:ring-red-100 outline-none font-medium"
                            value={form.owner}
                            onChange={(e) => onChange("owner", e.target.value)}
                            placeholder="ID o Usuario del Padre"
                        />
                    </div>
                </div>

                {/* CADUCIDAD */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Caducidad (Horas)</label>
                    <div className="relative">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="number"
                            min={1}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-2 focus:ring-red-100 outline-none font-medium"
                            value={form.expiresHours}
                            onChange={(e) => onChange("expiresHours", Number(e.target.value || 1))}
                        />
                    </div>
                </div>

                {/* SINGLE USE TOGGLE */}
                <div className="flex items-end pb-3">
                    <label className="flex items-center gap-3 p-3 w-full rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.singleUse ? 'bg-[#E33127] border-[#E33127]' : 'border-slate-300 bg-white'}`}>
                            {form.singleUse && <CheckBadgeIcon className="w-4 h-4 text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={form.singleUse}
                            onChange={(e) => onChange("singleUse", e.target.checked)}
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-700">Un solo uso</span>
                            <span className="text-xs text-slate-400">El enlace expira al registrarse</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-[#E33127] text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <LinkIcon className="w-5 h-5"/>}
                    {loading ? "Generando..." : "Generar Invitación"}
                </button>
            </div>
        </form>

        {/* RESULTADO (Tarjeta de Éxito) */}
        {resultUrl && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 animate-in slide-in-from-bottom-4 shadow-lg shadow-emerald-500/10">
                
                {/* Header Resultado */}
                <div className="flex items-center justify-between mb-6 border-b border-emerald-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                            <CheckBadgeIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900">Invitación Creada</h3>
                    </div>
                    {/* CONTADOR DE REGISTROS */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                        <UsersIcon className="w-4 h-4 text-emerald-600"/>
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                            Registros: {usageCount}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SECCIÓN 1: WEB */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800">
                            <GlobeAltIcon className="w-5 h-5"/>
                            <span className="font-bold text-sm uppercase tracking-wide">Registro vía Web</span>
                        </div>
                        <p className="text-sm text-emerald-700/80 leading-relaxed">
                            Proporcione este enlace a sus usuarios para que se registren por la Web.
                        </p>
                        <div className="relative group">
                            <input 
                                readOnly
                                value={resultUrl}
                                className="w-full p-4 pr-14 rounded-xl border border-emerald-200 bg-white text-emerald-900 font-mono text-sm focus:outline-none shadow-sm"
                            />
                            <button 
                                onClick={() => copyToClipboard(resultUrl)}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                title="Copiar Enlace"
                            >
                                <ClipboardDocumentIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* SECCIÓN 2: APP */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800">
                            <DevicePhoneMobileIcon className="w-5 h-5"/>
                            <span className="font-bold text-sm uppercase tracking-wide">Registro vía App</span>
                        </div>
                        <p className="text-sm text-emerald-700/80 leading-relaxed">
                            Proporcione el Código a sus usuarios para que se registren por medio de la APP.
                        </p>
                        <div className="relative group">
                            <div className="w-full p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-100/50 text-center">
                                <span className="font-mono font-black text-2xl text-emerald-900 tracking-widest">
                                    {referralCode}
                                </span>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(referralCode)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-800 transition-colors"
                                title="Copiar Código"
                            >
                                <ClipboardDocumentIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                </div>
                
                {/* FOOTER TEXTO */}
                <div className="mt-8 pt-4 border-t border-emerald-100 text-center">
                    <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4"/>
                        Estos usuarios serán administrados por usted.
                    </p>
                </div>

            </div>
        )}

      </div>
    </div>
  );
}