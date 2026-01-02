import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Para evitar que se cachee: force-dynamic (Next 15)
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
      // sin backend/token devolvemos null para que el header muestre "—"
      return NextResponse.json({ balance: null }, { status: 200 });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const endpoints = [
      "/wallet/balance",
      "/wallet/me",
      "/users/me/wallet",
      "/account/wallet",
      "/me/wallet",
    ];

    for (const ep of endpoints) {
      try {
        const r = await fetch(`${base}${ep}`, { headers, cache: "no-store" });
        if (!r.ok) continue;
        const txt = await r.text();
        let data: any;
        try { data = JSON.parse(txt); } catch { data = { value: txt }; }

        const val =
          pick<number>(data, ["balance","saldo","available","amount","total","wallet"]) ??
          pick<number>(data?.data, ["balance","saldo","available","amount","total"]);
        if (val !== null) {
          return NextResponse.json({ balance: Number(val) }, { status: 200 });
        }
      } catch { /* probar siguiente */ }
    }

    return NextResponse.json({ balance: null }, { status: 200 });
  } catch {
    return NextResponse.json({ balance: null }, { status: 200 });
  }
}




