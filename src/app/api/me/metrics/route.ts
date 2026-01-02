// src/app/api/me/metrics/route.ts

import { NextRequest, NextResponse } from "next/server";

const RAW_API =
  process.env.API_BASE ||
  process.env.NEXT_PUBLIC_API_FULL ||
  "http://localhost:8080/api/v1";

const API = RAW_API.replace(/\/$/, "");

export async function GET(req: NextRequest) {
  try {
    // reenviamos cookies de sesión al backend
    const cookie = req.headers.get("cookie") ?? "";

    // Usamos userId=1 fijo para que no se rompa el frontend
    const res = await fetch(`${API}/wallet/balance?userId=1`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        cookie,
      },
      // Node fetch, no hace falta credentials: "include"
    });

    if (!res.ok) {
      // si el backend falla, devolvemos 0 pero no rompemos el header
      return NextResponse.json(
        {
          balance: 0,
          profits: 0,
          currency: "USD",
          backendStatus: res.status,
        },
        { status: 200 }
      );
    }

    const json = await res.json().catch(() => null as any);

    const balance = Number(json?.balance ?? 0);
    const profit = Number(json?.profit ?? json?.profits ?? 0);
    const currency = String(json?.currency || "USD").toUpperCase();

    return NextResponse.json(
      {
        balance,
        profits: profit,
        currency,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("ERROR /api/me/metrics:", e);
    return NextResponse.json(
      {
        balance: 0,
        profits: 0,
        currency: "USD",
        error: "fetch_failed",
      },
      { status: 200 }
    );
  }
}

