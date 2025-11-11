"use client";

import { useEffect, useMemo, useState } from "react";

/** Lista completa conocida (fallback permanente). */
const OPERATORS_ALL: { code: string; name: string; currency: string; group: string }[] = [
  // 🇻🇪 Venezuela · Prepago
  { code: "movilnet",     name: "MOVILNET",                     currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "digitel",      name: "DIGITEL",                      currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "movistar",     name: "MOVISTAR",                     currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "simpletv",     name: "SimpleTV",                     currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "cantv",        name: "CANTV",                        currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "cantvtv",      name: "CANTV TV",                     currency: "Bs.",  group: "Venezuela · Prepago" },
  { code: "global",       name: "Global Link",                  currency: "Bs.",  group: "Venezuela · Prepago" },

  // 🇻🇪 Venezuela · Pospago / Otros
  { code: "interpos",     name: "INTER POSTPAGO SATELITAL",     currency: "Bs.",  group: "Venezuela · Pospago/Otros" },
  { code: "movistarpos",  name: "MOVISTAR POSTPAGO",            currency: "Bs.",  group: "Venezuela · Pospago/Otros" },
  { code: "digitelpos",   name: "DIGITEL POSTPAGO",             currency: "Bs.",  group: "Venezuela · Pospago/Otros" },
  { code: "movilnetpos",  name: "MOVILNET POSTPAGO",            currency: "Bs.",  group: "Venezuela · Pospago/Otros" },

  // 🇨🇴 Colombia
  { code: "claro",        name: "CLARO",                        currency: "COP",  group: "Colombia" },
  { code: "directv",      name: "DIRECTV Colombia",             currency: "COP",  group: "Colombia" },
  { code: "movistar_col", name: "MOVISTAR COL",                 currency: "COP",  group: "Colombia" },
  { code: "tigo",         name: "TIGO",                         currency: "COP",  group: "Colombia" },
  { code: "avantel",      name: "AVANTEL",                      currency: "COP",  group: "Colombia" },
  { code: "etb",          name: "ETB",                          currency: "COP",  group: "Colombia" },
  { code: "exito",        name: "ÉXITO",                        currency: "COP",  group: "Colombia" },
  { code: "virgin",       name: "VIRGIN",                       currency: "COP",  group: "Colombia" },
  { code: "flash",        name: "FLASH",                        currency: "COP",  group: "Colombia" },

  // 🇪🇨 Ecuador
  { code: "claro_ec",     name: "CLARO ECUADOR",                currency: "USD",  group: "Ecuador" },
  { code: "movistar_ec",  name: "MOVISTAR ECUADOR",             currency: "USD",  group: "Ecuador" },
  { code: "cnt_ec",       name: "CNT ECUADOR",                  currency: "USD",  group: "Ecuador" },
  { code: "tuenti_ec",    name: "TUENTI ECUADOR",               currency: "USD",  group: "Ecuador" },

  // 💳 USD / Varios
  { code: "disney",       name: "Disney",                       currency: "USD",  group: "USD / Servicios" },

  // 🎮 Pines / Servicios
  { code: "free_fire",    name: "Free Fire (Diamantes/Pin)",    currency: "USD",  group: "Pines / Gaming" },
  { code: "netflix",      name: "Netflix (Pin)",                currency: "COP",  group: "Pines / Streaming" },
  { code: "crunchyroll",  name: "Crunchyroll (Pin)",            currency: "COP",  group: "Pines / Streaming" },
  { code: "paramount",    name: "Paramount (Pin)",              currency: "COP",  group: "Pines / Streaming" },
  { code: "xbox",         name: "Xbox (Pin)",                   currency: "COP",  group: "Pines / Gaming" },
  { code: "pm",           name: "PM Promo",                     currency: "COP",  group: "Pines / Otros" },
];

type Operador = { code: string; name: string; currency: string; group: string };

type MontosProveedor = {
  monto_minimo?: string;
  monto_maximo?: string;
  multiplos?: string;
  montos?: Array<{ monto?: number | string; pvp?: number | string; amount?: number | string }>;
  items?:  Array<{ monto?: number | string; pvp?: number | string; amount?: number | string }>;
};

function toNumberLoose(x: unknown): number | null {
  if (x == null) return null;
  const s = String(x).trim();
  if (!s) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function dedupeByCode(a: Operador[]): Operador[] {
  const seen = new Set<string>();
  const out: Operador[] = [];
  for (const it of a) {
    if (!seen.has(it.code)) {
      seen.add(it.code);
      out.push(it);
    }
  }
  return out;
}

export default function RecargasCreatePage() {
  const [saldo, setSaldo] = useState<string | number | null>(null);

  const [opers, setOpers] = useState<Operador[]>(OPERATORS_ALL);
  const [tipo, setTipo] = useState<string>(OPERATORS_ALL[0]?.code || "");

  const [numero, setNumero] = useState("");
  const [monto, setMonto] = useState<number | "">("");

  const [prov, setProv] = useState<MontosProveedor | null>(null);
  const [montosCrudos, setMontosCrudos] = useState<string[]>([]);
  const [montosNum, setMontosNum] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [consulta, setConsulta] = useState<any>(null);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);

  const [defaultsMap, setDefaultsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recharge_defaults");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setDefaultsMap(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("recharge_defaults", JSON.stringify(defaultsMap));
    } catch {}
  }, [defaultsMap]);

  useEffect(() => {
    fetch("/api/danli/operadores", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const apiItems: Operador[] = Array.isArray(d?.items) ? d.items : [];
        if (apiItems.length) {
          const merged = dedupeByCode([...OPERATORS_ALL, ...apiItems]);
          setOpers(merged);
          if (!merged.some((o) => o.code === tipo)) setTipo(merged[0].code);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  useEffect(() => {
    fetch("/api/danli/saldos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSaldo(d?.balance ?? d?.saldo ?? "—"))
      .catch(() => setSaldo("—"));
  }, []);

  useEffect(() => {
    setProv(null);
    setMonto("");
    setMontosCrudos([]);
    setMontosNum([]);
    setConsulta(null);
    setErrorConsulta(null);

    if (!tipo) return;

    fetch(`/api/danli/montos?tipo=${encodeURIComponent(tipo)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: MontosProveedor) => {
        setProv(d);

        const rawArr = Array.isArray(d?.montos) ? d.montos :
                       Array.isArray(d?.items)  ? d.items  : [];

        const etiquetas: string[] = [];
        const numeros: number[]  = [];

        for (const x of rawArr) {
          const raw = (x?.monto ?? x?.pvp ?? x?.amount);
          if (raw === undefined || raw === null) continue;
          const rawText = String(raw);
          const rawNum  = toNumberLoose(rawText);
          etiquetas.push(rawText);
          if (rawNum != null) numeros.push(rawNum);
        }

        setMontosCrudos(etiquetas);
        setMontosNum(numeros);

        const saved = defaultsMap[tipo];
        if (saved != null && numeros.includes(saved)) {
          setMonto(saved);
        } else if (numeros.length) {
          const minFromProvider = Math.min(...numeros);
          setMonto(minFromProvider);
          setDefaultsMap((prev) => ({ ...prev, [tipo]: minFromProvider }));
        } else {
          setMonto("");
        }
      })
      .catch(() => {
        setProv(null);
        setMontosCrudos([]);
        setMontosNum([]);
        setMonto("");
      });
  }, [tipo]); // eslint-disable-line

  const currentOp = useMemo(() => opers.find((o) => o.code === tipo), [opers, tipo]);
  const currency  = currentOp?.currency || "";

  const minNum = useMemo(() => toNumberLoose(prov?.monto_minimo), [prov]);
  const maxNum = useMemo(() => toNumberLoose(prov?.monto_maximo), [prov]);

  function validar(): string | null {
    if (!tipo) return "Selecciona un operador.";
    if (!numero || numero.trim().length < 4) return "Ingresa el número/contrato.";
    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return "Selecciona o ingresa un monto válido.";
    if (minNum && n < minNum) return `El monto no puede ser menor a ${prov?.monto_minimo} (${currency}).`;
    if (maxNum && n > maxNum) return `El monto no puede ser mayor a ${prov?.monto_maximo} (${currency}).`;
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
      if (Number.isFinite(Number(monto))) {
        const m = Number(monto);
        setDefaultsMap((prev) => ({ ...prev, [tipo]: m }));
      }
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

  const isMovilnetPrepago = currentOp?.code === "movilnet";
  async function consultarMovilnet() {
    if (!numero || numero.trim().length < 4) {
      setErrorConsulta("Ingresa el número/contrato para consultar.");
      setConsulta(null);
      return;
    }
    setLoadingConsulta(true);
    setErrorConsulta(null);
    setConsulta(null);
    try {
      const r = await fetch("/api/danli/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "movilnet", numero }),
      });
      const j = await r.json();
      setConsulta(j);
    } catch (e: any) {
      setErrorConsulta(e?.message || "Error al consultar Movilnet");
    } finally {
      setLoadingConsulta(false);
    }
  }

  const hayListaProveedor = montosCrudos.length > 0 && montosNum.length > 0;

  const groups = useMemo(() => {
    const map = new Map<string, Operador[]>();
    for (const op of opers) {
      if (!map.has(op.group)) map.set(op.group, []);
      map.get(op.group)!.push(op);
    }
    return Array.from(map.entries());
  }, [opers]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recargas</h1>
          <p className="text-sm text-slate-600">Realiza recargas para tus clientes.</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-slate-500">Saldo del proveedor</div>
          <div className="text-lg font-semibold">{saldo === null ? "Cargando..." : saldo}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Operadores disponibles</h2>
            <span className="text-xs text-slate-500">{opers.length} operadores</span>
          </div>

          <div className="space-y-4">
            {groups.map(([groupName, list]) => (
              <div key={groupName}>
                <div className="mb-2 text-xs font-semibold text-slate-500">{groupName}</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {list.map((op) => {
                    const active = tipo === op.code;
                    return (
                      <button
                        key={op.code}
                        type="button"
                        onClick={() => setTipo(op.code)}
                        className={
                          "rounded-md border px-3 py-2 text-sm transition " +
                          (active ? "border-slate-900 bg-slate-900/5" : "border-slate-200 hover:bg-slate-50")
                        }
                        aria-pressed={active}
                      >
                        <div className="font-medium">{op.name}</div>
                        <div className="text-xs text-slate-500">{op.currency}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {currentOp && (
            <div className="mt-3 text-xs text-slate-600">
              Operador seleccionado:{" "}
              <span className="font-semibold">
                {currentOp.name} ({currentOp.currency})
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-medium">Datos de recarga</h2>

          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Número / Contrato</span>
              <div className="flex gap-2">
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej: 0416XXXXXXX / Contrato / ID"
                  className="flex-1 rounded-md border px-3 py-2"
                />
                {isMovilnetPrepago && (
                  <button
                    type="button"
                    onClick={consultarMovilnet}
                    disabled={loadingConsulta}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
                    title="Consultar saldo / estado (Movilnet)"
                  >
                    {loadingConsulta ? "Consultando…" : "Consultar"}
                  </button>
                )}
              </div>
            </label>

            {isMovilnetPrepago && (errorConsulta || consulta) && (
              <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {errorConsulta ? (
                  <span className="text-red-600">{errorConsulta}</span>
                ) : (
                  <div className="space-y-1">
                    {"saldo_string" in (consulta || {}) && (
                      <div><strong>Saldo línea:</strong> {consulta.saldo_string} </div>
                    )}
                    {"Estatus" in (consulta || {}) && (
                      <div><strong>Estatus:</strong> {consulta.Estatus}</div>
                    )}
                    {"dias" in (consulta || {}) && (
                      <div><strong>Días / Corte:</strong> {consulta.dias}</div>
                    )}
                    {"resultado_transaccion" in (consulta || {}) && (
                      <div><strong>Resultado:</strong> {consulta.resultado_transaccion}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {hayListaProveedor ? (
              <label className="grid gap-1">
                <span className="text-sm text-slate-600">
                  Monto {currentOp?.currency && `(${currentOp.currency})`}
                </span>
                <select
                  className="recharge-select rounded-md border px-3 py-2 appearance-none outline-none focus:outline-none"
                  value={monto === "" ? "" : String(monto)}
                  onChange={(e) => setMonto(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Seleccione</option>
                  {montosCrudos.map((label, i) => (
                    <option key={`${label}-${i}`} value={String(montosNum[i])}>
                      {label}
                    </option>
                  ))}
                </select>

                {isMovilnetPrepago ? (
                  <div className="mt-2 text-xs text-slate-600">
                    <span>🔹 Monto mínimo: 150,00 Bs.</span>
                    <span className="ml-3">🔸 Monto máximo: 3.000,00 Bs.</span>
                  </div>
                ) : (
                  (prov?.monto_minimo || prov?.monto_maximo) && (
                    <div className="mt-2 text-xs text-slate-500">
                      {prov?.monto_minimo && <span className="mr-3">Monto mínimo: {prov.monto_minimo}</span>}
                      {prov?.monto_maximo && <span>Monto máximo: {prov.monto_maximo}</span>}
                    </div>
                  )
                )}
              </label>
            ) : (
              <label className="grid gap-1">
                <span className="text-sm text-slate-600">
                  Monto {currentOp?.currency && `(${currentOp.currency})`}
                </span>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    setMonto(val as any);
                    if (val !== "") {
                      const num = Number(val);
                      if (Number.isFinite(num)) {
                        setDefaultsMap((prev) => ({ ...prev, [tipo]: num }));
                      }
                    }
                  }}
                  placeholder={currentOp?.currency === "Bs." ? "Ej: 150" : "Ej: 10"}
                  className="rounded-md border px-3 py-2"
                />

                {isMovilnetPrepago ? (
                  <div className="mt-2 text-xs text-slate-600">
                    <span>🔹 Monto mínimo: 150,00 Bs.</span>
                    <span className="ml-3">🔸 Monto máximo: 3.000,00 Bs.</span>
                  </div>
                ) : (
                  (prov?.monto_minimo || prov?.monto_maximo) && (
                    <div className="mt-2 text-xs text-slate-500">
                      {prov?.monto_minimo && <span className="mr-3">Mín: {prov.monto_minimo}</span>}
                      {prov?.monto_maximo && <span>Máx: {prov.monto_maximo}</span>}
                    </div>
                  )
                )}
              </label>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={loading || !tipo || !numero.trim() || monto === "" || !Number.isFinite(Number(monto))}
              onClick={hacerRecarga}
              className="mt-1 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Procesando…" : "Recargar"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-medium">Resultado</h2>
          {resp?.success === true && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">Éxito</span>
          )}
          {resp?.success === false && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">Error</span>
          )}
        </div>
        <pre className="max-h-[360px] overflow-auto rounded-md border bg-slate-50 p-3 text-xs">
{JSON.stringify(
  {
    recarga: resp ?? { info: "Aún no has realizado recargas." },
    consulta: consulta ?? undefined
  },
  null,
  2
)}
        </pre>
      </div>

      {/* Fuerza el rojo y elimina el morado del sistema/UA */}
      <style jsx global>{`
        select.recharge-select,
        select.recharge-select:focus,
        select.recharge-select:focus-visible {
          outline: none !important;
          border-color: #E53935 !important;
          box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.35) inset !important;
        }
        /* Safari/WebKit suele imponer -webkit-focus-ring-color */
        select.recharge-select::-webkit-focus-ring-color {
          color: #E53935 !important;
        }
      `}</style>
    </div>
  );
}











