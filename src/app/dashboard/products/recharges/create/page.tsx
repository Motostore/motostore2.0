"use client";

import { useEffect, useMemo, useState } from "react";

/** Operadores fallback */
const FALLBACK_OPERATORS = [
  // 🇻🇪 Venezuela (prepago)
  { code: "movilnet",     name: "MOVILNET",       currency: "Bs." },
  { code: "digitel",      name: "DIGITEL",        currency: "Bs." },
  { code: "movistar",     name: "MOVISTAR",       currency: "Bs." },
  { code: "simpletv",     name: "SimpleTV",       currency: "Bs." },
  { code: "cantv",        name: "CANTV",          currency: "Bs." },
  { code: "cantvtv",      name: "CANTV TV",       currency: "Bs." },
  { code: "global",       name: "Global Link",    currency: "Bs." },

  // 🇻🇪 Venezuela (pospago / otros)
  { code: "interpos",     name: "INTER POSTPAGO SATELITAL", currency: "Bs." },
  { code: "movistarpos",  name: "MOVISTAR POSTPAGO",        currency: "Bs." },
  { code: "digitelpos",   name: "DIGITEL POSTPAGO",         currency: "Bs." },

  // 🇨🇴 Colombia
  { code: "claro",        name: "CLARO",          currency: "COP" },
  { code: "directv",      name: "DIRECTV Colombia", currency: "COP" },
  { code: "movistar_col", name: "MOVISTAR COL",   currency: "COP" },
  { code: "tigo",         name: "TIGO",           currency: "COP" },
  { code: "avantel",      name: "AVANTEL",        currency: "COP" },
  { code: "etb",          name: "ETB",            currency: "COP" },
  { code: "exito",        name: "ÉXITO",          currency: "COP" },
  { code: "virgin",       name: "VIRGIN",         currency: "COP" },
  { code: "flash",        name: "FLASH",          currency: "COP" },

  // USD (servicios varios)
  { code: "disney",       name: "Disney",         currency: "USD" },
];

type Operador = { code: string; name: string; currency: string };

type MontosProveedor = {
  monto_minimo?: string;
  monto_maximo?: string;
  multiplos?: string;
  montos?: Array<{ monto?: number | string; pvp?: number | string; amount?: number | string }>;
  items?: Array<{ monto?: number | string; pvp?: number | string; amount?: number | string }>;
};

/** Parser robusto: detecta qué símbolo es decimal */
function toNumberLoose(x: unknown): number | null {
  if (x == null) return null;
  let s = String(x).trim();
  if (!s) return null;

  const hasDot = s.includes(".");
  const hasComma = s.includes(",");

  if (hasDot && hasComma) {
    s = s.replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  if (!hasDot && hasComma) {
    s = s.replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatMonto(n: number, currency: string) {
  if (currency === "Bs.") {
    return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
  if (currency === "COP") {
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export default function RecargasCreatePage() {
  const [saldo, setSaldo] = useState<string | number | null>(null);
  const [opers, setOpers] = useState<Operador[]>(FALLBACK_OPERATORS);
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [monto, setMonto] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [consultLoading, setConsultLoading] = useState(false);
  const [prov, setProv] = useState<MontosProveedor | null>(null);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/danli/operadores", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d?.items) && d.items.length) {
          setOpers(d.items);
          setTipo((prev) => prev || d.items[0].code);
        } else {
          setTipo((prev) => prev || FALLBACK_OPERATORS[0].code);
        }
      })
      .catch(() => setTipo((prev) => prev || FALLBACK_OPERATORS[0].code));
  }, []);

  useEffect(() => {
    fetch("/api/danli/saldos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSaldo(d?.balance ?? d?.saldo ?? "—"))
      .catch(() => setSaldo("—"));
  }, []);

  useEffect(() => {
    setProv(null);
    setMonto("");
    if (!tipo) return;
    fetch(`/api/danli/montos?tipo=${encodeURIComponent(tipo)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: MontosProveedor) => {
        const list = (Array.isArray(d?.montos) ? d?.montos
                    : Array.isArray(d?.items) ? d?.items : []) as MontosProveedor["montos"];

        const parsed = (list ?? [])
          .map((x) => toNumberLoose(x?.monto ?? x?.pvp ?? x?.amount))
          .filter((n): n is number => Number.isFinite(n));

        const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b);

        const normalized: MontosProveedor = {
          ...d,
          montos: uniqueSorted.map((n) => ({ monto: n })),
        };

        setProv(normalized);

        if (uniqueSorted.length) {
          setMonto(uniqueSorted[0]);
        }
      })
      .catch(() => setProv(null));
  }, [tipo]);

  const currency = useMemo(() => {
    const op = opers.find((o) => o.code === tipo);
    return op?.currency || "";
  }, [opers, tipo]);

  const min = useMemo(() => toNumberLoose(prov?.monto_minimo), [prov]);
  const max = useMemo(() => toNumberLoose(prov?.monto_maximo), [prov]);

  function validar(): string | null {
    if (!tipo) return "Selecciona un operador.";
    if (!numero || numero.trim().length < 4) return "Ingresa el número/contrato.";
    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return "Selecciona o ingresa un monto válido.";
    if (min && n < min) return `El monto no puede ser menor a ${formatMonto(min, currency)} ${currency}.`;
    if (max && n > max) return `El monto no puede ser mayor a ${formatMonto(max, currency)} ${currency}.`;
    return null;
  }

  async function hacerRecarga() {
    const v = validar();
    setError(v);
    setResp(null);
    if (v) return;
    setLoading(true);
    try {
      const r = await fetch("/api/danli/recarga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, numero, monto: Number(monto) }),
      });
      const j = await r.json();
      setResp(j);
      if (j?.success) {
        fetch("/api/danli/saldos", { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => setSaldo(d?.balance ?? d?.saldo ?? "—"))
          .catch(() => {});
      }
    } catch (e: any) {
      setError(e?.message || "Error realizando la recarga");
    } finally {
      setLoading(false);
    }
  }

  async function consultar() {
    if (!numero || numero.trim().length < 4) {
      setError("Ingresa el número a consultar.");
      return;
    }
    setError(null);
    setResp(null);
    setConsultLoading(true);
    try {
      const r = await fetch("/api/danli/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, numero }),
      });
      const j = await r.json();
      setResp(j);
    } catch (e: any) {
      setError(e?.message || "Error realizando la consulta");
    } finally {
      setConsultLoading(false);
    }
  }

  const montosSelect: number[] = useMemo(() => {
    const list = prov?.montos ?? [];
    const parsed = list
      .map((x) => toNumberLoose(x?.monto ?? (x as any)?.pvp ?? (x as any)?.amount))
      .filter((n): n is number => Number.isFinite(n));
    return Array.from(new Set(parsed)).sort((a, b) => a - b);
  }, [prov]);

  const isMovilnet = tipo === "movilnet";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recargas</h1>
          <p className="text-sm text-slate-600">Realiza recargas para tus clientes.</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-slate-500">Saldo del proveedor</div>
          <div className="text-lg font-semibold">
            {saldo === null ? "Cargando..." : saldo}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Operadores disponibles</h2>
            <span className="text-xs text-slate-500">{opers.length} operadores</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {opers.map((op) => {
              const active = tipo === op.code;
              return (
                <button
                  key={op.code}
                  type="button"
                  onClick={() => setTipo(op.code)}
                  className={
                    "rounded-md border px-3 py-2 text-sm transition " +
                    (active
                      ? "border-slate-900 bg-slate-900/5"
                      : "border-slate-200 hover:bg-slate-50")
                  }
                  aria-pressed={active}
                >
                  <div className="font-medium">{op.name}</div>
                  <div className="text-xs text-slate-500">{op.currency}</div>
                </button>
              );
            })}
          </div>

          {tipo && (
            <div className="mt-3 text-xs text-slate-600">
              Operador seleccionado:{" "}
              <span className="font-semibold">
                {opers.find((o) => o.code === tipo)?.name} ({currency || "—"})
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-medium">Datos de recarga</h2>
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Número / Contrato</span>
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ej: 0416XXXXXXX / Contrato / ID"
                className="rounded-md border px-3 py-2"
              />
            </label>

            {montosSelect.length > 0 ? (
              <label className="grid gap-1">
                <span className="text-sm text-slate-600">
                  Monto {currency && `(${currency})`}
                </span>
                {/* ÚNICO CAMBIO: estilos de foco/borde en fucsia (paleta) */}
                <select
                  className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600"
                  value={monto === "" ? "" : String(monto)}
                  onChange={(e) => setMonto(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Seleccione</option>
                  {montosSelect.map((m) => (
                    <option key={m} value={String(m)}>
                      {currency} {formatMonto(m, currency)}
                    </option>
                  ))}
                </select>

                {(prov?.monto_minimo || prov?.monto_maximo) && (
                  <div className="mt-2 text-xs text-slate-500">
                    {prov?.monto_minimo && (
                      <span className="mr-3">
                        {isMovilnet ? "✅ " : ""}
                        Monto mínimo: {prov.monto_minimo} {currency}
                      </span>
                    )}
                    {prov?.monto_maximo && (
                      <span>
                        {isMovilnet ? "⛔ " : ""}
                        Monto máximo: {prov.monto_maximo} {currency}
                      </span>
                    )}
                  </div>
                )}
              </label>
            ) : (
              <label className="grid gap-1">
                <span className="text-sm text-slate-600">
                  Monto {currency && `(${currency})`}
                </span>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) =>
                    setMonto(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={currency === "Bs." ? "Ej: 150" : "Ej: 10000"}
                  className="rounded-md border px-3 py-2"
                />
                {(prov?.monto_minimo || prov?.monto_maximo) && (
                  <div className="mt-2 text-xs text-slate-500">
                    {prov?.monto_minimo && (
                      <span className="mr-3">
                        {isMovilnet ? "✅ " : ""}
                        Mín: {prov.monto_minimo}
                      </span>
                    )}
                    {prov?.monto_maximo && (
                      <span>
                        {isMovilnet ? "⛔ " : ""}
                        Máx: {prov.monto_maximo}
                      </span>
                    )}
                  </div>
                )}
              </label>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              {isMovilnet && (
                <button
                  type="button"
                  onClick={consultar}
                  disabled={consultLoading}
                  className={
                    "rounded-md px-4 py-2 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 " +
                    (consultLoading
                      ? "bg-blue-400 text-white opacity-70"
                      : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500")
                  }
                  title="Consulta de saldo/estado (Movilnet)"
                >
                  {consultLoading ? "Consultando…" : "Consultar"}
                </button>
              )}

              <button
                disabled={loading}
                onClick={hacerRecarga}
                className={
                  "rounded-md px-4 py-2 font-medium shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
                  (isMovilnet
                    ? (loading
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500")
                    : (loading
                        ? "bg-slate-700 text-white"
                        : "bg-slate-900 hover:bg-black text-white focus:ring-slate-500"))
                }
              >
                {loading ? "Procesando…" : "Recargar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-medium">Resultado</h2>
          {resp?.success === true && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
              Éxito
            </span>
          )}
          {resp?.success === false && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">
              Error
            </span>
          )}
        </div>
        <pre className="max-h-[360px] overflow-auto rounded-md border bg-slate-50 p-3 text-xs">
{JSON.stringify(resp ?? { info: "Aún no has realizado recargas." }, null, 2)}
        </pre>
      </div>
    </div>
  );
}



















