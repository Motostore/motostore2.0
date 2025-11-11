// src/app/api/summary/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function apiBase() {
  const base =
    process.env.NEXT_PUBLIC_API_FULL ||
    process.env.API_BASE ||
    "";
  return base.replace(/\/$/, "");
}

async function firstOk(urls: string[], init: RequestInit) {
  for (const u of urls) {
    try {
      const r = await fetch(u, init);
      if (r.ok) return r.json().catch(() => ({}));
    } catch {/* ignore */}
  }
  return null;
}

function pickNumber(obj: any, keys: string[], def = 0): number {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.replace(/[^\d.-]/g, ""));
      if (!Number.isNaN(n)) return n;
    }
  }
  return def;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const base = apiBase();
    if (!base) {
      return NextResponse.json({ error: "API base no configurada" }, { status: 500 });
    }

    const token =
      (session as any)?.user?.accessToken ||
      (session as any)?.user?.token ||
      null;
    const role = (session as any)?.user?.role || "CLIENT";
    const userId =
      (session as any)?.user?.id ||
      (session as any)?.user?.userId ||
      null;

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
    };

    // ---- Balance (Wallet) ----
    const balanceUrls = [
      `${base}/wallet/balance`,
      `${base}/wallets/balance`,
      userId ? `${base}/wallet/${encodeURIComponent(String(userId))}/balance` : "",
      userId ? `${base}/wallets/${encodeURIComponent(String(userId))}/balance` : "",
      `${base}/finance/balance`,
      `${base}/account/balance`,
      `${base}/me/wallet/balance`,
    ].filter(Boolean);

    const balanceJson = (await firstOk(balanceUrls, { headers, cache: "no-store" })) || {};
    const balance = pickNumber(balanceJson, ["balance", "saldo", "walletBalance", "available", "availableBalance", "amount", "total"], 0);

    // ---- Utilidades (Profit) ----
    const profitUrlsClient = [
      `${base}/profits/me`,
      `${base}/reports/profits/me`,
      `${base}/utilities/me`,
      userId ? `${base}/profits/${encodeURIComponent(String(userId))}` : "",
      userId ? `${base}/reports/profits/${encodeURIComponent(String(userId))}` : "",
    ].filter(Boolean);

    const profitUrlsAdmin = [
      `${base}/profits/summary`,
      `${base}/reports/profits/summary`,
      `${base}/profits/total`,
      `${base}/utilities/summary`,
    ];

    const profitJson = (await firstOk(role === "CLIENT" ? profitUrlsClient : profitUrlsAdmin, { headers, cache: "no-store" })) || {};
    const profit = pickNumber(profitJson, ["profit", "profits", "utilities", "utilidades", "ganancias", "revenue", "totalProfit", "total"], 0);

    return NextResponse.json({ balance, profit, role }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ balance: 0, profit: 0 }, { status: 200 });
  }
}

