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

// Mapea el tipo de operador al endpoint de consulta del proveedor
function consultaAction(tipo: string): string | null {
  const t = tipo.toLowerCase();
  if (t === "movilnet") return "consulta_movilnet";
  if (t === "digitel")  return "consulta_digitel";
  if (t === "interpos" || t === "inter") return "consulta_inter";
  if (t === "simpletv") return "consulta_simpletv";
  if (t === "cantv" || t === "cantvtv") return "consulta_cantv";
  // agregar más si el proveedor los habilita
  return null;
}

export async function GET(req: Request) {
  if (!BASE || !KEY) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan DANLI_API_BASE / DANLI_API_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const tipo   = (searchParams.get("tipo")   || "").trim();
  const numero = (searchParams.get("numero") || "").trim();

  if (!tipo || !numero) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan parámetros ?tipo y ?numero" },
      { status: 400 }
    );
  }

  const action = consultaAction(tipo);
  if (!action) {
    return NextResponse.json(
      { ok: false, mensaje: `Consulta no soportada para tipo=${tipo}` },
      { status: 400 }
    );
  }

  try {
    const url = `${BASE}?${q({ action, numero, key: KEY })}`;
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
      { ok: false, mensaje: e?.message || "Error en consulta de línea/servicio" },
      { status: 500 }
    );
  }
}

