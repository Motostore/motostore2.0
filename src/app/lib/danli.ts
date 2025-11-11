// src/lib/danli.ts
import { z } from "zod";

const DANLI_BASE = (process.env.DANLI_API_BASE || "").replace(/\/$/, "");
const DANLI_KEY = process.env.DANLI_API_KEY;

if (!DANLI_BASE || !DANLI_KEY) {
  console.warn("[danli] Faltan variables DANLI_API_BASE o DANLI_API_KEY en .env.local");
}

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
    return { success: false, mensaje: text || "Respuesta no-JSON del proveedor" };
  }
}

/* ====== Schemas ====== */
const RecargaReq = z.object({
  tipo: z.string().min(1, "tipo requerido"),
  numero: z.string().min(4, "número requerido"),
  monto: z.coerce.number().positive("monto debe ser > 0"),
});
export type RecargaReq = z.infer<typeof RecargaReq>;

const RecargaResp = z.object({
  success: z.boolean().default(false),
  codigo_respuesta: z.string().optional(),
  mensaje: z.string().optional(),
  respuesta: z.string().optional(),
  codigo_aprobacion: z.string().optional(),
  saldo_agente: z.union([z.string(), z.number()]).optional(),
  alerta: z.string().optional(),
  id: z.string().optional(),
  renta_basica: z.union([z.number(), z.string()]).optional(),
  dias: z.union([z.string(), z.number()]).optional(),
});
export type RecargaResp = z.infer<typeof RecargaResp>;

const SaldosResp = z.object({
  code: z.string().optional(),
  balance: z.union([z.number(), z.string()]).optional(),
  mensaje: z.string().optional(),
});
export type SaldosResp = z.infer<typeof SaldosResp>;

/* Lista de montos (según proveedor: action=lista_montos&tipo=...) */
const ListaMontosResp = z.any(); // el proveedor devuelve estructuras variables
export type ListaMontosResp = z.infer<typeof ListaMontosResp>;

/* ====== Funciones ====== */
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

export async function saldos(): Promise<SaldosResp> {
  const resp = await callDanli({ action: "saldos" });
  return SaldosResp.parse(resp);
}

export async function listaMontos(tipo: string): Promise<ListaMontosResp> {
  if (!tipo) throw new Error("Falta 'tipo'");
  const resp = await callDanli({ action: "lista_montos", tipo });
  // El proveedor no tiene formato fijo; validamos la existencia básica
  return ListaMontosResp.parse(resp);
}


