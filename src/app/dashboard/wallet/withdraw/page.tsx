// src/app/dashboard/wallet/withdraw/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ===== Tipos ===== */
type PaymentMethod = {
  id: number;
  name: string;
  type:
    | "BANK_TRANSFER"
    | "BINANCE_PAYMENT"
    | "MOBILE_PAYMENT"
    | "WALLY_PAYMENT"
    | "ZELLE_PAYMENT"
    | "ZINLI_PAYMENT";
  status?: "ACTIVE" | "DELETED" | "DISABLED";
};

type BalanceDTO = { balance: number; currency?: string };

/* ===== Config API ===== */
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export default function WalletWithdrawPage() {
  /* ===== Estado ===== */
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [balance, setBalance] = useState<BalanceDTO | null>(null);

  const [amount, setAmount] = useState<string>("");
  const [methodId, setMethodId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [amountError, setAmountError] = useState<string | null>(null);

  /* ===== Carga inicial ===== */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [mRes, bRes] = await Promise.all([
          fetch(`${API}/api/v1/payment-methods`, {
            credentials: "include",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
          fetch(`${API}/api/v1/wallet/balance`, {
            credentials: "include",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
        ]);

        if (!cancel) {
          if (mRes.ok) {
            try {
              const m = (await mRes.json()) as PaymentMethod[];
              setMethods(m?.filter((x) => x?.status !== "DISABLED") ?? []);
            } catch {
              setMethods([]);
            }
          }

          if (bRes.ok) {
            try {
              const b = (await bRes.json()) as BalanceDTO;
              setBalance(b);
            } catch {
              setBalance(null);
            }
          }
        }
      } catch {
        // UI simple
      } finally {
        if (!cancel) setLoadingInit(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  /* ===== Derivados ===== */
  const maxAmount = useMemo(() => {
    const n = Number(balance?.balance ?? NaN);
    return Number.isFinite(n) ? n : undefined;
  }, [balance]);

  const currency = balance?.currency || "USD";

  /* ===== Validación simple ===== */
  function validateAmount(a: string) {
    const n = Number(a);
    if (!Number.isFinite(n) || n <= 0) return "Ingresa un monto válido (> 0).";
    if (maxAmount !== undefined && n > maxAmount)
      return "El monto supera tu saldo disponible.";
    return null;
  }

  /* ===== Envío ===== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const amtErr = validateAmount(amount);
    setAmountError(amtErr);
    if (amtErr) return;

    if (!methodId) {
      setMsg({ type: "err", text: "Selecciona un método de pago." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/wallet/withdraw`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethodId: Number(methodId),
          note: note || null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`.trim());
      }

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {}

      setMsg({
        type: "ok",
        text:
          payload?.message ||
          "Solicitud de retiro enviada. Te notificaremos cuando sea procesada.",
      });

      // Reset
      setAmount("");
      setMethodId("");
      setNote("");
      setAmountError(null);

      // Refrescar saldo
      try {
        const bRes = await fetch(`${API}/api/v1/wallet/balance`, {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (bRes.ok) setBalance(await bRes.json());
      } catch {}
    } catch (err: any) {
      setMsg({
        type: "err",
        text:
          err?.message ||
          "No se pudo enviar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ===== UI ===== */
  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Retirar dinero</h1>
          <p className="text-sm text-slate-600">
            Solicita retiros desde tu billetera.
          </p>
        </div>

        {loadingInit ? (
          <p className="text-brand-700/70">Cargando…</p>
        ) : (
          <>
            {/* Banner de saldo/no-saldo */}
            {balance ? (
              <div className="mb-6 rounded-lg border border-brand-200/70 bg-brand-50 px-3 py-2 text-sm text-brand-800">
                <span className="opacity-70">Saldo disponible:&nbsp;</span>
                <strong>
                  {Number(balance.balance).toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {currency}
                </strong>
              </div>
            ) : (
              <div className="mb-6 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                No fue posible obtener tu saldo.
              </div>
            )}

            {/* Mensaje global */}
            {msg && (
              <div
                className={
                  "mb-4 rounded-lg px-3 py-2 text-sm " +
                  (msg.type === "ok"
                    ? "border border-green-300 bg-green-50 text-green-700"
                    : "border border-danger/30 bg-red-50 text-danger")
                }
              >
                {msg.text}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">
                    Monto a retirar
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (amountError) setAmountError(null);
                      }}
                      className={`w-full rounded-md border bg-white pr-12 px-3 py-2 outline-none
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-300
                        ${amountError ? "border-red-400" : "border-slate-200"}`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                      {currency}
                    </span>
                  </div>
                  {maxAmount !== undefined && (
                    <p className="mt-1 text-xs text-slate-500">
                      Máximo disponible: {maxAmount.toFixed(2)} {currency}
                    </p>
                  )}
                  {amountError && (
                    <p className="mt-1 text-xs text-red-600">{amountError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">
                    Nota (opcional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-300"
                    placeholder="Información adicional para el retiro (opcional)…"
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-900">
                    Método de pago
                  </label>
                  {methods.length === 0 ? (
                    <p className="text-sm text-red-600">
                      No tienes métodos de pago activos para retiro.
                    </p>
                  ) : (
                    <select
                      value={methodId}
                      onChange={(e) => setMethodId(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-300"
                    >
                      <option value="">Selecciona…</option>
                      {methods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      methods.length === 0 ||
                      !methodId ||
                      !!validateAmount(amount)
                    }
                    className="w-full rounded-md bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {loading ? "Enviando…" : "Solicitar retiro"}
                  </button>

                  <p className="text-xs text-slate-600 flex items-start gap-2">
                    <span aria-hidden>ℹ️</span>
                    El retiro por saldo no tiene ningún costo adicional.
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}













