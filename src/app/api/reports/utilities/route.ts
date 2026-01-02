// src/app/api/reports/utilities/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Fuerza runtime Node y evita static optimization en Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolver BASE en tiempo de request (no en import) para que el build no falle
function getBase(): string | null {
  const base = (process.env.NEXT_PUBLIC_API_FULL || process.env.API_BASE || "").replace(/\/$/, "");
  return base || null;
}

export async function GET(req: Request) {
  const BASE = getBase();
  if (!BASE) {
    // No reventar el build: responder error claro en runtime si falta env
    return NextResponse.json(
      { error: "Falta configurar NEXT_PUBLIC_API_FULL o API_BASE en Vercel." },
      { status: 500 }
    );
  }

  const session = await getServerSession(authOptions as any);
  const token = (session as any)?.user?.accessToken || (session as any)?.user?.token;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Filtros opcionales: ?from=YYYY-MM-DD&to=YYYY-MM-DD
  const url = new URL(req.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  try {
    const query = qs.toString();
    const endpoint = `${BASE}/reports/utilities${query ? `?${query}` : ""}`;

    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend error", detail: text || res.statusText },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Normalización para mantener una sola clave `utilities`
    const normalized =
      (typeof data === "number" && { utilities: data }) ||
      (data?.utilities && { utilities: data.utilities }) ||
      (data?.utilidades && { utilities: data.utilidades }) ||
      (data?.profit && { utilities: data.profit }) ||
      data ||
      {};

    return NextResponse.json(normalized);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fetch failed", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

