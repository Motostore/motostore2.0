// src/app/api/danli/recarga/route.ts
import { NextResponse } from "next/server";
import { recarga, type RecargaReq } from "@/lib/danli";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RecargaReq>;

    if (!body?.tipo || !body?.numero || body?.monto == null) {
      return NextResponse.json(
        { ok: false, mensaje: "Campos requeridos: tipo, numero, monto" },
        { status: 400 }
      );
    }

    const resp = await recarga({
      tipo: String(body.tipo),
      numero: String(body.numero),
      monto: Number(body.monto),
    });

    return NextResponse.json(resp, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, mensaje: e?.message || "Error procesando recarga" },
      { status: 500 }
    );
  }
}


