import { NextResponse } from "next/server";

// Permitir cert self-signed en desarrollo si el flag está activo
if (process.env.DANLI_ALLOW_INSECURE_SSL === "true") {
  // ⚠️ SOLO DEV. Nunca habilitar en producción.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BASE = (process.env.DANLI_API_BASE || "").replace(/\/$/, "");
const KEY  = process.env.DANLI_API_KEY;

function q(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.set(k, String(v));
  }
  return sp.toString();
}

export async function GET(req: Request) {
  if (!BASE || !KEY) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan DANLI_API_BASE / DANLI_API_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") || "";

  if (!tipo) {
    return NextResponse.json({ ok: false, mensaje: "Falta ?tipo" }, { status: 400 });
  }

  try {
    const url = `${BASE}?${q({ action: "lista_montos", tipo, key: KEY })}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: 200 });
    } catch {
      // Algunos errores vienen en texto plano
      return NextResponse.json({ success: false, mensaje: text }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, mensaje: e?.message || "Error obteniendo montos" },
      { status: 500 }
    );
  }
}







