import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function pick<T = any>(obj: any, keys: string[]): T | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const token =
      (session as any)?.user?.accessToken ||
      (session as any)?.user?.token ||
      null;

    const base = (process.env.NEXT_PUBLIC_API_FULL || "").replace(/\/$/, "");
    if (!base || !token) {
      return NextResponse.json({ utility: null }, { status: 200 });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const endpoints = [
      "/reports/utilities/today",
      "/reports/utilities?range=today",
      "/reports/profit/today",
      "/utilities/today",
      "/profit/today",
    ];

    for (const ep of endpoints) {
      try {
        const r = await fetch(`${base}${ep}`, { headers, cache: "no-store" });
        if (!r.ok) continue;
        const txt = await r.text();
        let data: any;
        try { data = JSON.parse(txt); } catch { data = { value: txt }; }

        const val =
          pick<number>(data, ["utility","profit","net","netProfit","utilidad","ganancia"]) ??
          pick<number>(data?.data, ["utility","profit","net","netProfit","utilidad","ganancia"]);
        if (val !== null) {
          return NextResponse.json({ utility: Number(val) }, { status: 200 });
        }
      } catch { /* siguiente */ }
    }

    return NextResponse.json({ utility: null }, { status: 200 });
  } catch {
    return NextResponse.json({ utility: null }, { status: 200 });
  }
}


