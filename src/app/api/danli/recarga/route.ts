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

export async function POST(req: Request) {
  if (!BASE || !KEY) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan DANLI_API_BASE / DANLI_API_KEY" },
      { status: 500 }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, mensaje: "JSON inválido" }, { status: 400 });
  }

  const tipo   = (body?.tipo ?? "").toString().trim();
  const numero = (body?.numero ?? "").toString().trim();
  const monto  = Number(body?.monto);

  if (!tipo || !numero || !Number.isFinite(monto) || monto <= 0) {
    return NextResponse.json(
      { ok: false, mensaje: "Campos requeridos: tipo, numero, monto (> 0)" },
      { status: 400 }
    );
  }

  try {
    const url = `${BASE}?${q({ action: "recarga", tipo, numero, monto, key: KEY })}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: 200 });
    } catch {
      return NextResponse.json({ success: false, mensaje: text }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, mensaje: e?.message || "Error realizando la recarga" },
      { status: 500 }
    );
  }
}


