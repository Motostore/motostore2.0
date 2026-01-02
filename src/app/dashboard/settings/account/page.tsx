"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  ArrowPathIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

/* ================= HELPERS ================= */

const FALLBACK_API =
  "https://motostore-backend-240529100677.us-central1.run.app/api/v1";

function apiBase(): string {
  const base =
    (process.env.NEXT_PUBLIC_API_FULL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "") as string;

  const cleaned = base.replace(/\/+$/, "");
  return cleaned ? cleaned : FALLBACK_API;
}

function pickToken(s: any): string | null {
  const u = s?.user ?? {};
  return u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
}

function extractWalletBalance(payload: any): number | null {
  if (!payload) return null;

  const candidates = [
    payload?.balance,
    payload?.wallet?.balance,
    payload?.data?.balance,
    payload?.data?.wallet?.balance,
    payload?.result?.balance,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c)))
      return Number(c);
  }
  return null;
}

/* ================= PAGE COMPONENT ================= */

export default function SettingsAccountPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    username: "",
  });

  // 1) Cargar datos iniciales desde sesión
  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || u.telefono || u.mobile || "",
        dni: u.dni || u.cedula || u.identification || "",
        username: u.username || "",
      });
    }
  }, [session]);

  // 2) ✅ SINCRONIZAR AUTOMÁTICAMENTE: /me + /wallet/me (cada 30s)
  useEffect(() => {
    let isActive = true;

    async function syncMeAndWallet() {
      if (!session?.user) return;

      const token = pickToken(session);
      if (!token) return;

      const base = apiBase();

      try {
        // ✅ /me
        const meRes = await fetch(`${base}/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const meData = meRes.ok ? await meRes.json() : null;

        // ✅ /wallet/me (saldo real)
        const wRes = await fetch(`${base}/wallet/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const wData = wRes.ok ? await wRes.json() : null;
        const realBalance = extractWalletBalance(wData);

        const currentUser = (session.user as any) ?? {};
        const mergedUser = {
          ...currentUser,
          ...(meData || {}),
          ...(realBalance !== null
            ? { balance: realBalance, balanceText: String(realBalance) }
            : {}),
          phone:
            (meData?.telefono ?? currentUser?.telefono ?? currentUser?.phone) ??
            currentUser?.phone ??
            null,
        };

        // ✅ actualizar sesión
        if (isActive && updateSession) {
          await updateSession({
            ...session,
            user: mergedUser,
          } as any);
        }

        // ✅ reflejar en el formulario
        if (isActive) {
          setForm((prev) => ({
            ...prev,
            name: mergedUser?.name || prev.name,
            email: mergedUser?.email || prev.email,
            phone: mergedUser?.telefono || mergedUser?.phone || prev.phone,
            dni: mergedUser?.cedula || mergedUser?.dni || prev.dni,
            username: mergedUser?.username || prev.username,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }

    // corre una vez al entrar
    syncMeAndWallet();

    // ✅ y luego cada 30 segundos
    const id = setInterval(syncMeAndWallet, 30_000);

    return () => {
      isActive = false;
      clearInterval(id);
    };
  }, [session, updateSession]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!form.name.trim()) return toast.error("El nombre es obligatorio.");

    setLoading(true);
    const token = pickToken(session);
    const base = apiBase();
    const userId = (session?.user as any)?.id;

    try {
      // 1) Petición al Backend
      const res = await fetch(`${base}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,

          // ✅ backend real
          telefono: form.phone,
          cedula: form.dni,

          // ✅ compatibilidad
          phone: form.phone,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar perfil.");

      // 2) Actualizar sesión del lado del cliente (NextAuth)
      if (updateSession) {
        await updateSession({
          ...session,
          user: {
            ...(session?.user as any),
            name: form.name,
            email: form.email,
            telefono: form.phone,
            cedula: form.dni,
            phone: form.phone,
          },
        } as any);
      }

      toast.success("¡Datos actualizados correctamente!");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar cambios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#333", color: "#fff" } }}
      />

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
            <UserIcon className="w-8 h-8 text-[#E33127]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Datos de <span className="text-[#E33127]">Cuenta</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Administra tu información personal y de contacto.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E33127] to-red-500"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* COLUMNA 1 */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                <IdentificationIcon className="w-4 h-4" /> Identidad
              </h3>

              <div className="space-y-4">
                {/* Usuario */}
                <div className="relative group opacity-75">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                    Usuario
                  </label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      disabled
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold cursor-not-allowed"
                      value={form.username}
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                      placeholder="Tu nombre completo"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* DNI */}
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Cédula / DNI
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                      placeholder="Documento de identidad"
                      value={form.dni}
                      onChange={(e) => setForm({ ...form, dni: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA 2 */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                <EnvelopeIcon className="w-4 h-4" /> Contacto
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#E33127] transition-colors" />
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#E33127] focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                      placeholder="0412-0000000"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-slate-900 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-slate-900/20 hover:bg-[#E33127] hover:shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" /> Guardando...
                </>
              ) : (
                <>Guardar Cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
