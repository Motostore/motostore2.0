// src/app/dashboard/purchases/report-payment/page.tsx
"use client";

import { useState } from "react";

type FormState = {
  orderId: string;
  amount: string;
  method: string;
  reference: string;
  date: string;   // yyyy-MM-dd
  time: string;   // HH:mm
  notes: string;
  file?: File | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function ReportPaymentPage() {
  const [form, setForm] = useState<FormState>({
    orderId: "",
    amount: "",
    method: "",
    reference: "",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    // Validaciones mínimas
    if (!form.amount || Number(form.amount) <= 0) {
      setErr("Por favor, ingresa un monto válido.");
      return;
    }
    if (!form.method) {
      setErr("Selecciona un método de pago.");
      return;
    }
    if (!form.reference.trim()) {
      setErr("Ingresa la referencia del pago.");
      return;
    }

    try {
      setSubmitting(true);

      // Combina fecha+hora a ISO
      const isoDateTime = new Date(`${form.date}T${form.time}:00`).toISOString();

      const fd = new FormData();
      fd.append("amount", String(form.amount));
      fd.append("method", form.method);
      fd.append("reference", form.reference.trim());
      fd.append("paidAt", isoDateTime);
      if (form.orderId.trim()) fd.append("orderId", form.orderId.trim());
      if (form.notes.trim()) fd.append("notes", form.notes.trim());
      if (form.file) fd.append("receipt", form.file, form.file.name);

      // Ajusta la ruta del backend según tu API real:
      const res = await fetch(`${API_BASE}/api/v1/payments/report`, {
        method: "POST",
        body: fd,
        // si tu backend usa sesión por cookie:
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      setOk("¡Pago reportado correctamente! Será verificado por el sistema.");
      setForm((f) => ({
        ...f,
        orderId: "",
        amount: "",
        method: "",
        reference: "",
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        notes: "",
        file: null,
      }));
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo enviar el reporte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Reportar pago</h1>
        <p className="text-sm text-gray-600">
          Completa el formulario para reportar tu pago. Adjunta el comprobante si lo tienes.
        </p>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              ID de orden (opcional)
            </label>
            <input
              className="input w-full"
              placeholder="Ej: ORD-12345"
              value={form.orderId}
              onChange={(e) => onChange("orderId", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Monto (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input w-full"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => onChange("amount", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Método de pago
            </label>
            <select
              className="input w-full"
              value={form.method}
              onChange={(e) => onChange("method", e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              <option value="ZELLE">Zelle</option>
              <option value="TRANSFERENCIA">Transferencia bancaria</option>
              <option value="BINANCE">Binance Pay</option>
              <option value="USDT">USDT</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Referencia
            </label>
            <input
              className="input w-full"
              placeholder="Código, número o texto de referencia"
              value={form.reference}
              onChange={(e) => onChange("reference", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Fecha del pago
            </label>
            <input
              type="date"
              className="input w-full"
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Hora del pago
            </label>
            <input
              type="time"
              className="input w-full"
              value={form.time}
              onChange={(e) => onChange("time", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              className="input w-full min-h-[90px]"
              placeholder="Información adicional que quieras compartir…"
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-700 mb-1">
              Comprobante (opcional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:hover:bg-slate-50"
              onChange={(e) => onChange("file", e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Formatos permitidos: imágenes o PDF. Tamaño máx. recomendado 5MB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar reporte"}
          </button>
          <button
            type="button"
            disabled={submitting}
            className="btn btn-ghost"
            onClick={() =>
              setForm((f) => ({
                ...f,
                orderId: "",
                amount: "",
                method: "",
                reference: "",
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toTimeString().slice(0, 5),
                notes: "",
                file: null,
              }))
            }
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

/* 
Tailwind helpers esperados en tu proyecto:

.input {
  @apply rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500;
}
.btn { @apply inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium; }
.btn-primary { @apply bg-[var(--brand,#E53935)] text-white hover:brightness-95; }
.btn-ghost { @apply text-slate-700 hover:bg-slate-100; }
*/

