// src/app/dashboard/settings/SettingsView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type AnyUser = Record<string, any>;

function normalizeRole(raw?: string): string {
  const r = String(raw ?? "").trim().toUpperCase();
  if (r === "SUPERUSUARIO") return "SUPERUSER";
  return r;
}

export default function SettingsView() {
  const { data: session, status } = useSession();
  const user: AnyUser | undefined = session?.user as AnyUser | undefined;

  const currentRole = useMemo(
    () => normalizeRole(user?.role ?? user?.rol),
    [user?.role, user?.rol]
  );

  if (status === "loading") {
    return (
      <div className="rounded-lg border p-4 animate-pulse">
        Cargando configuración…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-lg border p-4">
        Debes iniciar sesión para ver esta página.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* (El título “Perfil” ahora vive en page.tsx para evitar duplicado) */}
      <AccountPanel user={user} effectiveRole={currentRole || "-"} />
    </div>
  );
}

/* -------- Panel Perfil en casillas separadas -------- */
function AccountPanel({
  user,
  effectiveRole,
}: {
  user?: AnyUser;
  effectiveRole?: string;
}) {
  const subordinateRoles = (() => {
    const r = String(effectiveRole ?? "").toUpperCase();
    if (r === "SUPERUSER") return ["ADMIN", "DISTRIBUTOR", "TAQUILLA", "CLIENT"];
    if (r === "ADMIN") return ["DISTRIBUTOR", "TAQUILLA", "CLIENT"];
    if (r === "DISTRIBUTOR") return ["TAQUILLA", "CLIENT"];
    if (r === "TAQUILLA") return ["CLIENT"];
    return [];
  })();

  const [commissions, setCommissions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    subordinateRoles.forEach((role) => (init[role] = 0));
    return init;
  });

  useEffect(() => {
    setCommissions((prev) => {
      const next = { ...prev };
      subordinateRoles.forEach((role) => {
        if (next[role] == null) next[role] = 0;
      });
      Object.keys(next).forEach((k) => {
        if (!subordinateRoles.includes(k)) delete (next as any)[k];
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole]);

  const handlePercent = (role: string, val: string) => {
    const n = Math.max(0, Math.min(100, Number(val)));
    setCommissions((m) => ({ ...m, [role]: isFinite(n) ? n : 0 }));
  };

  return (
    // Grid: 2 columnas en desktop; comisiones ocupa todo el ancho
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1) Datos de cuenta */}
      <div
        id="datos"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm scroll-mt-24"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Datos de cuenta</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <CardLine label="Usuario" value={user?.username ?? user?.name ?? "-"} />
          <CardLine label="Rol" value={effectiveRole ?? "-"} />
          <CardLine label="Email" value={user?.email ?? "-"} />
          <CardLine label="ID" value={user?.id ?? "-"} />
        </div>
      </div>

      {/* 2) Cambio de clave */}
      <div
        id="clave"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm scroll-mt-24"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Cambio de clave</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Clave actual</label>
            <input type="password" className="input w-full" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nueva clave</label>
            <input type="password" className="input w-full" placeholder="••••••••" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Confirmar nueva clave</label>
            <input type="password" className="input w-full" placeholder="••••••••" />
          </div>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary">Actualizar clave</button>
        </div>
      </div>

      {/* 3) Teléfono SMS y/o WhatsApp */}
      <div
        id="telefono"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm scroll-mt-24"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Teléfono SMS y/o WhatsApp</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm text-gray-600 mb-1">Código de país</label>
            <input type="text" className="input w-full" placeholder="+57" defaultValue="+57" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Número</label>
            <input type="tel" className="input w-full" placeholder="300 000 0000" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" defaultChecked />
            Recibir SMS
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" defaultChecked />
            Recibir por WhatsApp
          </label>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary">Guardar teléfono</button>
        </div>
      </div>

      {/* 4) Comisiones (ocupa dos columnas) */}
      <div
        id="comisiones"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm scroll-mt-24 md:col-span-2"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Comisiones</h2>

        {subordinateRoles.length === 0 ? (
          <p className="text-sm text-gray-600">
            Tu rol no tiene usuarios subordinados. No hay comisiones para asignar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Rol subordinado</th>
                  <th className="py-2 pr-4">Porcentaje (%)</th>
                  <th className="py-2">Descripción (opcional)</th>
                </tr>
              </thead>
              <tbody>
                {subordinateRoles.map((role) => (
                  <tr key={role} className="border-t border-gray-200">
                    <td className="py-2 pr-4 font-medium">{role}</td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={commissions[role] ?? 0}
                        onChange={(e) => handlePercent(role, e.target.value)}
                        className="input w-28"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="input w-full"
                        placeholder={`Ej: Comisión para ${role.toLowerCase()}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            className="btn btn-primary"
            onClick={() => alert("Comisiones guardadas (demo).")}
          >
            Guardar comisiones
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const reset: Record<string, number> = {};
              subordinateRoles.forEach((r) => (reset[r] = 0));
              setCommissions(reset);
            }}
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}

function CardLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value ?? "-"}</div>
    </div>
  );
}




















