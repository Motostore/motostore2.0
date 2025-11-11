// src/lib/danli.ts
import { z } from "zod";

/** ==== Config ==== */
const RAW_BASE = (process.env.DANLI_API_BASE || "").trim();
const DANLI_BASE = RAW_BASE.replace(/\/$/, "");
const DANLI_KEY = (process.env.DANLI_API_KEY || "").trim();

if (!DANLI_BASE || !DANLI_KEY) {
  console.warn("[danli] Faltan DANLI_API_BASE o DANLI_API_KEY en .env.local");
}

/** SSL self-signed (solo si lo pides en .env) */
if ((process.env.DANLI_ALLOW_INSECURE_SSL || "").toLowerCase() === "true") {
  // ⚠️ Úsalo solo en desarrollo
  // @ts-ignore
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/** ==== Utils ==== */
function q(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

async function callDanli(params: Record<string, any>) {
  if (!DANLI_BASE || !DANLI_KEY) {
    throw new Error("Falta configuración de DANLI_API_BASE/DANLI_API_KEY");
  }
  const url = `${DANLI_BASE}?${q({ ...params, key: DANLI_KEY })}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, mensaje: text };
  }
}

/** ==== Schemas ==== */
const RecargaReq = z.object({
  tipo: z.string().min(1),
  numero: z.string().min(4),
  monto: z.coerce.number().positive(),
});
export type RecargaReq = z.infer<typeof RecargaReq>;

const RecargaResp = z.object({
  success: z.boolean().default(false),
  alerta: z.string().optional(),
  saldo_agente: z.union([z.string(), z.number()]).optional(),
  codigo_aprobacion: z.string().optional(),
  desconexion: z.string().optional(),
  codigo_respuesta: z.string().optional(),
  dias: z.union([z.string(), z.number()]).optional(),
  renta_basica: z.union([z.number(), z.string()]).optional(),
  mensaje: z.string().optional(),
  respuesta: z.string().optional(),
  id: z.string().optional(),
  saldo_linea: z.union([z.number(), z.string()]).optional(),
  numero_mvto: z.string().optional(),
  pvp: z.union([z.number(), z.string()]).optional(),
  moneda: z.string().optional(),
});
export type RecargaResp = z.infer<typeof RecargaResp>;

const SaldosResp = z.object({
  success: z.boolean().optional(),
  code: z.union([z.string(), z.boolean()]).optional(),
  balance: z.union([z.number(), z.string()]).optional(),
  mensaje: z.string().optional(),
});
export type SaldosResp = z.infer<typeof SaldosResp>;

export async function saldos(): Promise<SaldosResp> {
  const resp = await callDanli({ action: "saldos" });
  return SaldosResp.parse(resp);
}

export async function listaMontos(tipo: string): Promise<any> {
  if (!tipo) throw new Error("Falta 'tipo'");
  const resp = await callDanli({ action: "lista_montos", tipo });
  return resp; // normalizamos en el route handler
}

export async function recarga(payload: RecargaReq): Promise<RecargaResp> {
  const data = RecargaReq.parse(payload);
  const resp = await callDanli({
    action: "recarga",
    tipo: data.tipo,
    numero: data.numero,
    monto: data.monto,
  });
  return RecargaResp.parse(resp);
}

/** Operadores del proveedor */
export const DANLI_OPERATORS: { label: string; code: string; currency: string }[] = [
  { label: "MOVILNET", code: "movilnet", currency: "Bs." },
  { label: "DIGITEL", code: "digitel", currency: "Bs." },
  { label: "MOVISTAR", code: "movistar", currency: "Bs." },
  { label: "SimpleTV", code: "simpletv", currency: "Bs." },
  { label: "Global Link", code: "global", currency: "Bs." },
  { label: "CLARO", code: "claro", currency: "COP" },
  { label: "DIRECTV COL", code: "directv", currency: "COP" },
  { label: "MOVISTAR COL", code: "movistar_col", currency: "COP" },
  { label: "AVANTEL", code: "avantel", currency: "COP" },
  { label: "TIGO", code: "tigo", currency: "COP" },
  { label: "CANTV", code: "cantv", currency: "Bs." },
  { label: "CANTV TV", code: "cantvtv", currency: "Bs." },
  { label: "ETB", code: "etb", currency: "COP" },
  { label: "EXITO", code: "exito", currency: "COP" },
  { label: "VIRGIN", code: "virgin", currency: "COP" },
  { label: "FLASH", code: "flash", currency: "COP" },
  { label: "INTER POSTPAGO SATELITAL", code: "interpos", currency: "Bs." },
  { label: "MOVISTAR POSTPAGO", code: "movistarpos", currency: "Bs." },
  { label: "DIGITEL POSTPAGO", code: "digitelpos", currency: "Bs." },
  { label: "Disney", code: "disney", currency: "USD" },
];



