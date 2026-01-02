import { NextResponse } from "next/server";

// Permite conexión a la IP del proveedor sin errores de SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") || "";

  if (!tipo) return NextResponse.json({ ok: false, mensaje: "Falta tipo" }, { status: 400 });

  try {
    // Datos finales proporcionados con tu KEY
    const url = `https://192.142.2.85/service/api?action=lista_montos&tipo=${tipo}&key=6286HWW0081794`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text();
    
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({ ok: false, mensaje: "Error de formato", raw: text });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, mensaje: e.message }, { status: 500 });
  }
}