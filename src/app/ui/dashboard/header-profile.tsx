"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

/* ---------- helpers ---------- */
function safeMoney(n: unknown) {
  try {
    const num = Number(n ?? 0);
    if (!isFinite(num)) return "—";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(num);
  } catch {
    return "—";
  }
}
function pick<T = any>(obj: any, keys: string[]): T | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return null;
}
/* ----------------------------- */

export default function HeaderProfile() {
  const { data: session, status } = useSession();

  // 🟢 NO cortamos el render antes de declarar hooks.
  const isAuthed = status === "authenticated" && Boolean(session?.user);
  const user: any = isAuthed ? session!.user : undefined;

  const username =
    user?.username ?? user?.name ?? user?.email?.split("@")[0] ?? "usuario";

  // Backend base y token (seguros aunque no haya sesión)
  const API = useMemo(() => {
    try {
      const raw = String(process.env.NEXT_PUBLIC_API_FULL || "");
      return raw.replace(/\/$/, "");
    } catch {
      return "";
    }
  }, []);

  const token: string | null = useMemo(() => {
    if (!isAuthed) return null;
    const u: any = user ?? {};
    const t = u?.token ?? u?.accessToken ?? (session as any)?.accessToken ?? null;
    return typeof t === "string" ? t : null;
  }, [isAuthed, user, session]);

  // Estado mostrado (placeholders por defecto)
  const [saldoText, setSaldoText] = useState<string>(user?.balanceText ?? "—");
  const [utilText, setUtilText] = useState<string>(user?.utilityText ?? "—");

  useEffect(() => {
    // Si no hay sesión o credenciales, no hacemos nada (pero el hook IGUAL se declaró)
    if (!isAuthed || !API || !token) return;
    const controller = new AbortController();

    const headers: Record<string, string> = { Accept: "application/json" };
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    const fetchJson = async (path: string) => {
      const url = `${API}${path}`;
      const res = await fetch(url, { headers, signal: controller.signal });
      const txt = await res.text();
      try {
        return { ok: res.ok, data: JSON.parse(txt) as any };
      } catch {
        return { ok: res.ok, data: { value: txt } as any };
      }
    };

    (async () => {
      try {
        // Saldo
        const saldoEndpoints = [
          "/wallet/balance",
          "/wallet/me",
          "/users/me/wallet",
          "/account/wallet",
          "/me/wallet",
        ];
        for (const ep of saldoEndpoints) {
          try {
            const r = await fetchJson(ep);
            if (!r.ok) continue;
            const d = r.data;
            const balance =
              pick<number>(d, ["balance", "saldo", "available", "amount", "total", "wallet"]) ??
              pick<number>(d?.data, ["balance", "saldo", "available", "amount", "total"]);
            if (balance !== null) {
              setSaldoText(safeMoney(balance));
              break;
            }
          } catch {}
        }

        // Utilidades (hoy)
        const utilEndpoints = [
          "/reports/utilities/today",
          "/reports/utilities?range=today",
          "/reports/profit/today",
          "/utilities/today",
          "/profit/today",
        ];
        for (const ep of utilEndpoints) {
          try {
            const r = await fetchJson(ep);
            if (!r.ok) continue;
            const d = r.data;
            const util =
              pick<number>(d, ["utility", "profit", "net", "netProfit", "utilidad", "ganancia"]) ??
              pick<number>(d?.data, ["utility", "profit", "net", "netProfit", "utilidad", "ganancia"]);
            if (util !== null) {
              setUtilText(safeMoney(util));
              break;
            }
          } catch {}
        }
      } catch (e) {
        console.error("HeaderProfile error:", e);
      }
    })();

    return () => controller.abort();
  }, [isAuthed, API, token]);

  // Ahora sí: si no está autenticado, NO renderizamos el bloque
  if (!isAuthed) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-slate-600 shrink-0">
      <span>
        Bienvenido, <b className="text-slate-800">{username}</b>
      </span>

      {/* 💵 Saldo */}
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span aria-hidden className="text-[15px] leading-none" title="Saldo">💵</span>
        <span>
          <span className="text-slate-800">Saldo:</span>{" "}
          <span className="text-slate-700 font-medium">{saldoText}</span>
        </span>
      </span>

      {/* 🚀 Utilidades */}
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span aria-hidden className="text-[15px] leading-none" title="Utilidades">🚀</span>
        <span>
          <span className="text-slate-800">Utilidades:</span>{" "}
          <span className="text-slate-700 font-medium">{utilText}</span>
        </span>
      </span>

      {/* Perfil */}
      <Link
        href="/dashboard/settings?tab=account#datos"
        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 transition"
        title="Abrir Perfil"
        aria-label="Abrir Perfil"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
        </svg>
      </Link>
    </div>
  );
}




















