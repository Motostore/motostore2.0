"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_FULL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}
function pickToken(s: any) {
  const u = s?.user ?? {};
  const t = u?.token ?? u?.accessToken ?? (s as any)?.accessToken ?? null;
  return typeof t === "string" && t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
}
function normRole(r: unknown) {
  const v = String(r ?? "").trim().toUpperCase();
  return v === "SUPERUSUARIO" ? "SUPERUSER" : v || "CLIENT";
}

export default function NoticeChips() {
  const { data: session } = useSession();
  const base = useMemo(() => apiBase(), []);
  const token = useMemo(() => pickToken(session), [session]);
  const role = normRole((session as any)?.user?.role);

  const [globalMsg, setGlobalMsg] = useState<string>("");
  const [roleMsg, setRoleMsg] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      // fallback: permite mostrar un mensaje global desde env si no hay backend
      const fallbackGlobal = (process.env.NEXT_PUBLIC_DASH_ANNOUNCE_GLOBAL || "").trim();
      if (fallbackGlobal) setGlobalMsg(fallbackGlobal);

      if (!base) return;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = token;

      const urls = [
        `${base}/dashboard/announcements?role=${encodeURIComponent(role)}`,
        `${base}/api/dashboard/announcements?role=${encodeURIComponent(role)}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: "no-store", headers });
          if (!res.ok) continue;
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            let g = "", r = "";
            const items = Array.isArray(data) ? data : data?.items || [];
            if (Array.isArray(items)) {
              for (const it of items) {
                const scope = String(it?.scope || it?.audience || "").toUpperCase();
                const msg   = String(it?.message || it?.text || "").trim();
                const rr    = String(it?.role || "").toUpperCase();
                if (!msg) continue;
                if (scope === "GLOBAL") g ||= msg;
                if (scope === "ROLE" && (rr === role || !rr)) r ||= msg;
              }
            } else {
              g = String(data?.global || "").trim();
              r = String(data?.role || "").trim();
            }
            if (alive) {
              if (g) setGlobalMsg(g);
              if (r) setRoleMsg(r);
            }
            break;
          }
        } catch {}
      }
    })();
    return () => { alive = false; };
  }, [base, token, role]);

  if (!globalMsg && !roleMsg) return null;

  return (
    <div className="bg-transparent">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-2">
        <div className="flex flex-wrap gap-2">
          {globalMsg && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
              <span aria-hidden>🛈</span>
              <span className="truncate">{globalMsg}</span>
            </span>
          )}
          {roleMsg && (
            <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs text-fuchsia-800">
              <span aria-hidden>🎯</span>
              <span className="truncate">{roleMsg}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
